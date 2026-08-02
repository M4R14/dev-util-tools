import type { FamilyMember, FamilyNode } from './familyTree';

/**
 * Coordinates for the conventional family-tree diagram: partners side by side joined by a bar,
 * children hanging from the middle of that bar on square elbows.
 *
 * Pure, so the geometry is tested without rendering anything. The renderer only turns these numbers
 * into SVG.
 */
export interface LaidOutMember {
  member: FamilyMember;
  /** Centre of the box horizontally, top of the box vertically. */
  x: number;
  y: number;
  depth: number;
  /** True for the partner who married in and shares the slot. */
  isSpouse: boolean;
  /** Drawn children. Zero for a collapsed node even when it has descendants. */
  childCount: number;
  /** People folded away under this node, from `collapseHierarchy`. */
  hiddenDescendants: number;
}

export interface Connector {
  kind: 'spouse' | 'descent';
  /** Points of a polyline, already on square corners. */
  points: { x: number; y: number }[];
}

export interface FamilyLayout2D {
  boxes: LaidOutMember[];
  connectors: Connector[];
  width: number;
  height: number;
  metrics: Required<Layout2DOptions>;
}

export interface Layout2DOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  avatarSize?: number;
  /** Gap between two partners, which is also the length of the bar joining them. */
  spouseGap?: number;
  siblingGap?: number;
  /** Vertical gap between the bottom of one generation and the top of the next. */
  levelGap?: number;
  padding?: number;
}

const DEFAULTS: Required<Layout2DOptions> = {
  nodeWidth: 116,
  nodeHeight: 96,
  avatarSize: 60,
  spouseGap: 44,
  siblingGap: 28,
  levelGap: 76,
  padding: 24,
};

export const layoutFamilyTree2D = (
  roots: FamilyNode[],
  options: Layout2DOptions = {},
): FamilyLayout2D => {
  const metrics = { ...DEFAULTS, ...options };
  const { nodeWidth, nodeHeight, avatarSize, spouseGap, siblingGap, levelGap, padding } = metrics;

  const unitWidth = (node: FamilyNode) =>
    node.spouse ? nodeWidth * 2 + spouseGap : nodeWidth;

  /**
   * Width of everything under a node, measured bottom-up before anything is placed.
   *
   * A parent can be wider than its children — a married couple with one child — or narrower, with
   * six children under a single person. Taking the larger of the two and centring the smaller
   * inside it handles both without a second pass to push overlapping subtrees apart.
   */
  const widthOf = (node: FamilyNode): number => {
    const childrenWidth = node.children.reduce(
      (total, child, index) => total + widthOf(child) + (index > 0 ? siblingGap : 0),
      0,
    );

    return Math.max(unitWidth(node), childrenWidth);
  };

  const boxes: LaidOutMember[] = [];
  const connectors: Connector[] = [];
  const rowY = (depth: number) => padding + depth * (nodeHeight + levelGap);

  const place = (node: FamilyNode, left: number, depth: number) => {
    const width = widthOf(node);
    const centreX = left + width / 2;
    const y = rowY(depth);

    const own = {
      depth,
      childCount: node.children.length,
      hiddenDescendants: node.hiddenDescendants ?? 0,
    };
    // The married-in partner shares the slot but owns none of the children, so a fold control on
    // their side would claim a branch that is not theirs.
    const partner = { depth, childCount: 0, hiddenDescendants: 0 };

    if (node.spouse) {
      const offset = (nodeWidth + spouseGap) / 2;
      boxes.push({ member: node.member, x: centreX - offset, y, isSpouse: false, ...own });
      boxes.push({ member: node.spouse, x: centreX + offset, y, isSpouse: true, ...partner });

      // The bar sits at the avatars' height, so the drop to the children passes between the two
      // names rather than through them.
      const barY = y + avatarSize / 2;
      connectors.push({
        kind: 'spouse',
        points: [
          { x: centreX - offset, y: barY },
          { x: centreX + offset, y: barY },
        ],
      });
    } else {
      boxes.push({ member: node.member, x: centreX, y, isSpouse: false, ...own });
    }

    if (node.children.length === 0) return;

    const childrenWidth = node.children.reduce(
      (total, child, index) => total + widthOf(child) + (index > 0 ? siblingGap : 0),
      0,
    );

    let cursor = left + (width - childrenWidth) / 2;
    const childCentres: number[] = [];

    for (const child of node.children) {
      const childWidth = widthOf(child);
      place(child, cursor, depth + 1);
      childCentres.push(cursor + childWidth / 2);
      cursor += childWidth + siblingGap;
    }

    // A couple drops from the bar between them; a single parent from under their own name.
    const dropFromY = node.spouse ? y + avatarSize / 2 : y + nodeHeight;
    const busY = y + nodeHeight + levelGap / 2;
    const childTopY = rowY(depth + 1);

    connectors.push({
      kind: 'descent',
      points: [
        { x: centreX, y: dropFromY },
        { x: centreX, y: busY },
      ],
    });

    // One horizontal run across the children, then a drop into each. A single child needs no run,
    // and drawing a zero-length one leaves a visible dot at the join.
    if (childCentres.length > 1) {
      connectors.push({
        kind: 'descent',
        points: [
          { x: Math.min(...childCentres), y: busY },
          { x: Math.max(...childCentres), y: busY },
        ],
      });
    }

    for (const childCentre of childCentres) {
      connectors.push({
        kind: 'descent',
        points: [
          { x: childCentre, y: busY },
          { x: childCentre, y: childTopY },
        ],
      });
    }
  };

  let cursor = padding;
  for (const root of roots) {
    place(root, cursor, 0);
    cursor += widthOf(root) + siblingGap * 2;
  }

  const deepest = boxes.reduce((max, box) => Math.max(max, box.depth), 0);
  const right = boxes.reduce((max, box) => Math.max(max, box.x + nodeWidth / 2), 0);

  return {
    boxes,
    connectors,
    width: boxes.length === 0 ? 0 : right + padding,
    height: boxes.length === 0 ? 0 : rowY(deepest) + nodeHeight + padding,
    metrics,
  };
};
