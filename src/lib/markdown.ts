import { Marked, type Tokens } from 'marked';

/**
 * Markdown rendering for repo-authored content.
 *
 * `marked` passes raw HTML through untouched by default, and the output here goes straight into
 * `dangerouslySetInnerHTML`. Two things follow from that:
 *
 * 1. **Raw HTML is escaped, not executed.** Blog posts are prose, not templates — nothing needs to
 *    emit markup. The symptom this actually prevents is not an attack but silent data loss: a
 *    release note reading `support <div> wrappers` would otherwise lose `<div>` from the page.
 *    `auto-release-notes.md` is generated from git commit subjects, so that text is not curated.
 *
 * 2. **Link and image URLs are restricted to a protocol allowlist.** `marked` renders
 *    `[x](javascript:alert(1))` as a live `javascript:` href; verified against marked 17.
 *
 * This is an escaping layer, not a sanitiser. It is sufficient because every input is markdown
 * committed to this repository. Rendering third-party or user-submitted markdown would need a real
 * sanitiser (DOMPurify) instead.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Relative paths and fragments have no protocol to abuse, so they are allowed as-is. */
export const isSafeUrl = (href: string): boolean => {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (/^[#/]/.test(trimmed)) return true;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true;

  try {
    return SAFE_PROTOCOLS.has(new URL(trimmed).protocol);
  } catch {
    return false;
  }
};

/**
 * Returning `false` from a renderer override tells `marked` to fall back to its default, so the
 * common (safe) path keeps marked's own escaping rather than a reimplementation of it.
 */
const renderer = {
  html({ text }: Tokens.HTML | Tokens.Tag): string {
    return escapeHtml(text);
  },
  link(
    this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } },
    token: Tokens.Link,
  ) {
    if (isSafeUrl(token.href)) return false as const;
    // Drop the href, keep what the reader was meant to see.
    return this.parser.parseInline(token.tokens);
  },
  image(token: Tokens.Image) {
    if (isSafeUrl(token.href)) return false as const;
    return escapeHtml(token.text);
  },
};

const instance = new Marked({ gfm: true, breaks: true }).use({ renderer });

const toStringResult = (parsed: string | Promise<string>): string =>
  typeof parsed === 'string' ? parsed : '';

/** Render block-level markdown: headings, lists, tables, code fences. */
export const renderMarkdown = (input: string): string => {
  if (!input.trim()) return '';
  return toStringResult(instance.parse(input));
};

/** Render inline markdown only — no block wrappers. Used for post summaries. */
export const renderInlineMarkdown = (input: string): string => {
  if (!input.trim()) return '';
  return toStringResult(instance.parseInline(input));
};
