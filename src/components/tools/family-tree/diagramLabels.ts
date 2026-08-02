import { createCanvasMeasurer, truncateToWidth } from '../../../lib/tools/svgText';
import { formatLifespan } from '../../../lib/tools/familyTree/lifeDates';
import type { LaidOutMember } from '../../../lib/tools/familyTree/layout';

/** Must match what the SVG `<text>` classes resolve to, or the measurement is of the wrong font. */
const NAME_FONT = '500 13px system-ui, -apple-system, "Noto Sans Thai", sans-serif';
const DETAIL_FONT = '400 11px system-ui, -apple-system, "Noto Sans Thai", sans-serif';

/** Leaves a little air either side of the widest label inside its slot. */
const SIDE_PADDING = 8;

export interface DiagramLabel {
  /** The untruncated text, for the `<title>` and the accessible name. */
  full: string;
  detail: string;
  /** What actually gets drawn. */
  name: string;
  shortDetail: string;
}

/**
 * Cuts each label to the width of its slot.
 *
 * SVG `<text>` neither wraps nor clips, so a long name simply runs over its neighbour — two Thai
 * names at 140px in a 116px slot overlapped into an unreadable smear. Measuring beats counting
 * characters: an earlier version cut notes at 22 characters and left names alone entirely, which is
 * both inconsistent and wrong for any script where glyph widths vary.
 *
 * The measurers are built once per call rather than per label — creating the canvas is the slow
 * part, not measuring against it.
 */
export const buildDiagramLabels = (
  boxes: LaidOutMember[],
  nodeWidth: number,
): Map<string, DiagramLabel> => {
  const measureName = createCanvasMeasurer(NAME_FONT);
  const measureDetail = createCanvasMeasurer(DETAIL_FONT);
  const available = nodeWidth - SIDE_PADDING;

  return new Map(
    boxes.map((box) => {
      const full = box.member.name || 'Untitled';
      // Lifespan first: on a family tree the years are what the reader is usually looking for.
      const detail = [
        formatLifespan(box.member.birth, box.member.death),
        box.member.relationship,
        box.member.note,
      ]
        .filter(Boolean)
        .join(' · ');

      return [
        box.member.id,
        {
          full,
          detail,
          name: truncateToWidth(full, available, measureName),
          shortDetail: truncateToWidth(detail, available, measureDetail),
        },
      ];
    }),
  );
};
