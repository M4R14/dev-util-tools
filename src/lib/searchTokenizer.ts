/**
 * Tokenising text for search across Thai and English.
 *
 * MiniSearch's default tokeniser splits on whitespace and punctuation, which is fine for English
 * and useless for Thai: Thai is written without spaces between words, so an entire sentence becomes
 * a single token. Searching `ลายเซ็น` against a post containing `การเซ็นและตรวจลายเซ็นต้องใช้`
 * matched nothing, because the term sits in the middle of that one token and prefix search only
 * reaches token starts.
 *
 * `Intl.Segmenter` carries the Unicode word-break data needed to split Thai properly and is
 * built into the platform, so this costs no dependency and no dictionary of our own.
 */

/** Undefined on platforms without `Intl.Segmenter`; callers fall back to punctuation splitting. */
const segmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : null;

const FALLBACK_SPLIT = /[\n\r\p{Z}\p{P}\p{S}]+/u;

/**
 * Unicode word-breaking treats `.` `_` `/` between letters as word-internal — correct for
 * `example.com`, wrong for a developer changelog where `crypto.subtle` and `window.DevPulseAI`
 * should also be findable by their parts. Both the whole term and its parts are emitted, so
 * searching `subtle` and searching `crypto.subtle` each work.
 */
const SUBWORD_SPLIT = /[._/]+/;

const expandSubwords = (token: string): string[] => {
  const parts = token.split(SUBWORD_SPLIT).filter(Boolean);
  return parts.length > 1 ? [token, ...parts] : [token];
};

export const tokenizeText = (text: string): string[] => {
  if (!text) return [];

  if (!segmenter) {
    return text.split(FALLBACK_SPLIT).filter(Boolean).flatMap(expandSubwords);
  }

  return [...segmenter.segment(text)]
    .filter((entry) => entry.isWordLike)
    .flatMap((entry) => expandSubwords(entry.segment));
};
