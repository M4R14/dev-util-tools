/**
 * Pulls values out of a JSON document by path.
 *
 * A 500-line API response usually has one field worth looking at. Without this the options are
 * scrolling, or opening devtools and writing the accessor by hand — which is a detour through a
 * different tool just to read a value the browser already has.
 *
 * A deliberate subset of JSONPath: property access, array indexing, and the `*` wildcard over both
 * objects and arrays. Filters and script expressions are not supported, because they turn a reader
 * into an evaluator and this needs to stay safe on untrusted input.
 */

export interface JsonPathMatch {
  /** Concrete path to this match, with wildcards resolved. */
  path: string;
  value: unknown;
}

type Segment =
  | { kind: 'key'; key: string }
  | { kind: 'index'; index: number }
  | { kind: 'wildcard' };

const parseSegments = (path: string): Segment[] => {
  const trimmed = path.trim();
  if (!trimmed) throw new Error('Enter a path');

  // A leading $ or . is optional; `data.items[0]` and `$.data.items[0]` mean the same thing.
  let rest = trimmed.startsWith('$') ? trimmed.slice(1) : trimmed;
  const segments: Segment[] = [];

  while (rest.length > 0) {
    if (rest.startsWith('.')) {
      rest = rest.slice(1);
      if (rest.startsWith('.')) {
        throw new Error('Recursive descent (..) is not supported');
      }
      continue;
    }

    if (rest.startsWith('[')) {
      const close = rest.indexOf(']');
      if (close === -1) throw new Error('Unclosed [ in path');

      const inner = rest.slice(1, close).trim();
      rest = rest.slice(close + 1);

      if (inner === '*') {
        segments.push({ kind: 'wildcard' });
      } else if (/^-?\d+$/.test(inner)) {
        segments.push({ kind: 'index', index: Number(inner) });
      } else if (/^'.*'$/.test(inner) || /^".*"$/.test(inner)) {
        segments.push({ kind: 'key', key: inner.slice(1, -1) });
      } else {
        throw new Error(`Cannot read "[${inner}]" — use an index, '*', or a quoted key`);
      }
      continue;
    }

    const match = rest.match(/^[^.[]+/);
    if (!match) throw new Error(`Unexpected character at "${rest}"`);

    rest = rest.slice(match[0].length);
    segments.push(match[0] === '*' ? { kind: 'wildcard' } : { kind: 'key', key: match[0] });
  }

  return segments;
};

const childPath = (parent: string, key: string): string =>
  /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const queryJsonPath = (root: unknown, path: string): JsonPathMatch[] => {
  const segments = parseSegments(path);
  let current: JsonPathMatch[] = [{ path: '$', value: root }];

  for (const segment of segments) {
    const next: JsonPathMatch[] = [];

    for (const match of current) {
      if (segment.kind === 'wildcard') {
        if (Array.isArray(match.value)) {
          match.value.forEach((item, index) =>
            next.push({ path: `${match.path}[${index}]`, value: item }),
          );
        } else if (isRecord(match.value)) {
          for (const [key, value] of Object.entries(match.value)) {
            next.push({ path: childPath(match.path, key), value });
          }
        }
        continue;
      }

      if (segment.kind === 'index') {
        if (!Array.isArray(match.value)) continue;
        // Negative indexes count from the end, which is how people read log output.
        const index = segment.index < 0 ? match.value.length + segment.index : segment.index;
        if (index < 0 || index >= match.value.length) continue;
        next.push({ path: `${match.path}[${index}]`, value: match.value[index] });
        continue;
      }

      if (isRecord(match.value) && Object.prototype.hasOwnProperty.call(match.value, segment.key)) {
        next.push({ path: childPath(match.path, segment.key), value: match.value[segment.key] });
      }
    }

    current = next;
    // Nothing matched, and nothing downstream can bring matches back.
    if (current.length === 0) break;
  }

  return current;
};

export const queryJsonText = (json: string, path: string): JsonPathMatch[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(`Not valid JSON: ${(error as Error).message}`);
  }

  return queryJsonPath(parsed, path);
};

/** Matches as a JSON array, or the bare value when a path resolved to exactly one thing. */
export const formatJsonPathMatches = (matches: JsonPathMatch[]): string => {
  if (matches.length === 0) return '';
  if (matches.length === 1) return JSON.stringify(matches[0].value, null, 2);

  return JSON.stringify(
    matches.map((m) => m.value),
    null,
    2,
  );
};
