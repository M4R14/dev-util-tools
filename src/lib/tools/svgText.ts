/**
 * Fitting a label into a fixed width, for SVG `<text>` which neither wraps nor truncates.
 *
 * Measurement is injected rather than done here: the only honest way to measure a rendered string
 * is to ask the same engine that will draw it, and that needs a canvas or a live DOM node. Taking a
 * `measure` function keeps the fitting logic testable without either.
 */
export type MeasureText = (text: string) => number;

const ELLIPSIS = '…';

let graphemes: Intl.Segmenter | null = null;

/**
 * Splits into grapheme clusters, not code points.
 *
 * Thai writes vowels and tone marks as separate code points that attach to the consonant before
 * them, so `Array.from('เกิด')` can hand back a bare `ิ` and slicing between them produces a
 * dotted-circle placeholder. `Intl.Segmenter` keeps each cluster whole.
 */
const toClusters = (text: string): string[] => {
  if (typeof Intl === 'undefined' || typeof Intl.Segmenter === 'undefined') {
    return Array.from(text);
  }

  graphemes ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(graphemes.segment(text), (entry) => entry.segment);
};

/**
 * Returns `text` unchanged when it fits, otherwise the longest prefix that fits with an ellipsis.
 *
 * Returns the ellipsis alone rather than an empty string when not even one cluster fits — a label
 * that vanishes reads as "this person has no name", which is a different and wrong statement.
 */
export const truncateToWidth = (
  text: string,
  maxWidth: number,
  measure: MeasureText,
): string => {
  if (!text || measure(text) <= maxWidth) return text;

  const clusters = toClusters(text);

  for (let length = clusters.length - 1; length > 0; length -= 1) {
    const candidate = clusters.slice(0, length).join('') + ELLIPSIS;
    if (measure(candidate) <= maxWidth) return candidate;
  }

  return ELLIPSIS;
};

/**
 * A measurer backed by a canvas, cached because creating one per label is the slow part.
 *
 * Returns a measurer that always answers 0 when there is no canvas — in that case nothing is ever
 * truncated, which degrades to today's overflowing behaviour rather than to blank labels.
 */
export const createCanvasMeasurer = (font: string): MeasureText => {
  const context =
    typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');

  if (!context) return () => 0;

  context.font = font;
  return (text: string) => context.measureText(text).width;
};
