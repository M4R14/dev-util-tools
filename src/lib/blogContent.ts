/**
 * Splitting a bilingual blog body into per-language sections.
 *
 * Nine of the ten posts in `src/content/blog` are written as `## TH` followed by `## EN`, but that
 * was only a writing habit — nothing read it, so both languages rendered stacked and every reader
 * scrolled past half the page. This turns the habit into structure.
 *
 * `auto-release-notes.md` has no headings at all, and posts written before the convention may not
 * either. Anything outside a language heading becomes `shared` and is shown whichever language is
 * selected, so an unconventional post degrades to "always visible" rather than disappearing.
 */

export const BLOG_LANGUAGES = ['th', 'en'] as const;

export type BlogLanguage = (typeof BLOG_LANGUAGES)[number];

export interface BlogLanguageSections {
  /** Content outside any language heading. Rendered regardless of the selected language. */
  shared: string;
  th: string;
  en: string;
}

/** Matches `## TH` / `## EN` (any heading level, any case) on its own line. */
const LANGUAGE_HEADING = /^(#{1,6})\s*(TH|EN)\s*$/i;

export const splitLanguageSections = (body: string): BlogLanguageSections => {
  const buckets: Record<'shared' | BlogLanguage, string[]> = { shared: [], th: [], en: [] };
  let current: 'shared' | BlogLanguage = 'shared';

  for (const line of body.split('\n')) {
    const match = line.match(LANGUAGE_HEADING);

    if (match) {
      // The heading itself is dropped — the language picker already says which one you are reading.
      current = match[2].toLowerCase() as BlogLanguage;
      continue;
    }

    buckets[current].push(line);
  }

  const join = (lines: string[]) => lines.join('\n').trim();

  return { shared: join(buckets.shared), th: join(buckets.th), en: join(buckets.en) };
};

/** True when the post has nothing language-specific, so a language filter must not hide it. */
export const isLanguageNeutral = (sections: BlogLanguageSections): boolean =>
  !sections.th && !sections.en;
