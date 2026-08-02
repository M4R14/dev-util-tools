/**
 * Reads a `curl` command into its parts.
 *
 * "Copy as cURL" from devtools is how a request usually reaches QA, and it arrives as one long line
 * with escaped quotes, a JSON body flattened into a single string, and headers in whatever order
 * the browser emitted. Getting at the body means hand-unescaping it.
 *
 * This is a reader, not a shell. It understands the quoting rules curl commands actually use —
 * single quotes, double quotes with backslash escapes, and line continuations — and stops there.
 * Shell expansion, subshells and variables are not interpreted; a command relying on them will
 * parse into literal text rather than silently doing something else.
 */

export interface ParsedCurl {
  method: string;
  url: string;
  /** Query parameters lifted out of the URL, in the order they appear. */
  query: { key: string; value: string }[];
  headers: { key: string; value: string }[];
  body: string | null;
  /** Flags that were recognised but carry no data, e.g. `--compressed`, `-L`. */
  flags: string[];
  /** Anything not understood, surfaced rather than dropped so the reader can judge. */
  unrecognized: string[];
}

/**
 * Splits on whitespace while respecting quotes and backslash-escapes, and folds away the
 * `\`-newline continuations that multi-line curl commands are wrapped with.
 */
export const tokenizeCurl = (command: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let started = false;

  for (let i = 0; i < command.length; i += 1) {
    const char = command[i];

    if (quote === "'") {
      // Single quotes are literal in shells — no escapes inside.
      if (char === "'") quote = null;
      else current += char;
      continue;
    }

    if (quote === '"') {
      if (char === '\\' && i + 1 < command.length) {
        const next = command[i + 1];
        // Only these are special inside double quotes; anything else keeps its backslash.
        current += ['"', '\\', '$', '`', '\n'].includes(next) ? next : `\\${next}`;
        i += 1;
        continue;
      }
      if (char === '"') quote = null;
      else current += char;
      continue;
    }

    if (char === '\\' && command[i + 1] === '\n') {
      i += 1; // line continuation
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      started = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (current || started) {
        tokens.push(current);
        current = '';
        started = false;
      }
      continue;
    }

    current += char;
  }

  if (current || started) tokens.push(current);

  return tokens;
};

const HEADER_FLAGS = new Set(['-H', '--header']);
const DATA_FLAGS = new Set(['-d', '--data', '--data-raw', '--data-binary', '--data-ascii']);
const METHOD_FLAGS = new Set(['-X', '--request']);
const VALUE_FLAGS = new Set([
  ...HEADER_FLAGS,
  ...DATA_FLAGS,
  ...METHOD_FLAGS,
  '-u',
  '--user',
  '-A',
  '--user-agent',
  '-e',
  '--referer',
  '--url',
]);
const KNOWN_BOOLEAN_FLAGS = new Set([
  '-L',
  '--location',
  '--compressed',
  '-k',
  '--insecure',
  '-s',
  '--silent',
  '-i',
  '--include',
  '-v',
  '--verbose',
  '-g',
  '--globoff',
]);

const splitOnce = (value: string, separator: string): [string, string] | null => {
  const index = value.indexOf(separator);
  if (index === -1) return null;
  return [value.slice(0, index).trim(), value.slice(index + separator.length).trim()];
};

export const parseCurl = (command: string): ParsedCurl => {
  const trimmed = command.trim();
  if (!trimmed) throw new Error('Paste a curl command');

  const tokens = tokenizeCurl(trimmed);
  if (tokens.length === 0 || tokens[0] !== 'curl') {
    throw new Error('Command must start with "curl"');
  }

  const headers: ParsedCurl['headers'] = [];
  const flags: string[] = [];
  const unrecognized: string[] = [];
  let method: string | null = null;
  let url = '';
  let body: string | null = null;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (VALUE_FLAGS.has(token)) {
      const value = tokens[i + 1];
      if (value === undefined) {
        unrecognized.push(`${token} (missing value)`);
        continue;
      }
      i += 1;

      if (HEADER_FLAGS.has(token)) {
        const pair = splitOnce(value, ':');
        if (pair) headers.push({ key: pair[0], value: pair[1] });
        else unrecognized.push(`${token} ${value}`);
      } else if (DATA_FLAGS.has(token)) {
        // Repeated -d flags are joined with & by curl itself.
        body = body === null ? value : `${body}&${value}`;
      } else if (METHOD_FLAGS.has(token)) {
        method = value.toUpperCase();
      } else if (token === '--url') {
        url = value;
      } else {
        flags.push(`${token} ${value}`);
      }
      continue;
    }

    if (KNOWN_BOOLEAN_FLAGS.has(token)) {
      flags.push(token);
      continue;
    }

    if (token.startsWith('-')) {
      unrecognized.push(token);
      continue;
    }

    if (!url) url = token;
    else unrecognized.push(token);
  }

  if (!url) throw new Error('No URL found in the command');

  // curl's own rule: a body implies POST unless -X says otherwise.
  const resolvedMethod = method ?? (body !== null ? 'POST' : 'GET');

  const query: ParsedCurl['query'] = [];
  let cleanUrl = url;

  const questionMark = url.indexOf('?');
  if (questionMark !== -1) {
    cleanUrl = url.slice(0, questionMark);
    const search = new URLSearchParams(url.slice(questionMark + 1));
    for (const [key, value] of search.entries()) query.push({ key, value });
  }

  return { method: resolvedMethod, url: cleanUrl, query, headers, body, flags, unrecognized };
};

/** Pretty-prints the body when it is JSON, leaving anything else exactly as sent. */
export const formatCurlBody = (body: string | null): { text: string; isJson: boolean } => {
  if (body === null) return { text: '', isJson: false };

  try {
    return { text: JSON.stringify(JSON.parse(body), null, 2), isJson: true };
  } catch {
    return { text: body, isJson: false };
  }
};
