import type { FamilyMember, FamilyNode } from './types';

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

/** How far above the row each successive marriage bar arcs. */
const RAISED_BAR_STEP = 14;

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

  /** The holder plus every partner drawn beside them, with a bar's worth of gap between each. */
  const unitWidth = (node: FamilyNode) =>
    nodeWidth * (node.spouses.length + 1) + spouseGap * node.spouses.length;

  /**
   * Splits children by the marriage they belong to, in the order the partners are drawn.
   *
   * This is what makes half-siblings readable: without it, the children of a first and a second
   * marriage sit in one undifferentiated row under a parent with nothing to say they have different
   * mothers. Children with no recorded second parent come last and hang from the holder alone,
   * rather than being attributed to a marriage nobody claimed.
   */
  const childGroups = (
    node: FamilyNode,
  ): { partnerId: string | null; children: FamilyNode[] }[] => {
    const claimed = new Set(node.spouses.map((spouse) => spouse.id));
    const isAttributed = (child: FamilyNode) =>
      Boolean(child.member.otherParentId) && claimed.has(child.member.otherParentId as string);

    /*
     * With exactly one partner there is nothing to be ambiguous about, so an unrecorded second
     * parent means that partner. Without this, every tree built before the field existed would
     * suddenly drop its children from one parent alone instead of the couple bar.
     */
    if (node.spouses.length === 1) {
      return node.children.length > 0
        ? [{ partnerId: node.spouses[0].id, children: node.children }]
        : [];
    }

    const groups = node.spouses.map((spouse) => ({
      partnerId: spouse.id as string | null,
      children: node.children.filter((child) => child.member.otherParentId === spouse.id),
    }));

    const unattributed = node.children.filter((child) => !isAttributed(child));
    if (unattributed.length > 0) groups.push({ partnerId: null, children: unattributed });

    return groups.filter((group) => group.children.length > 0);
  };

  /** In group order, so a subtree is laid out left to right the way the groups are drawn. */
  const orderedChildren = (node: FamilyNode): FamilyNode[] =>
    childGroups(node).flatMap((group) => group.children);

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

  /**
   * Where a group of children drops from.
   *
   * The first marriage descends from the middle of the bar between the couple, as it always has.
   * Later marriages descend from under that partner instead, because the midpoint of a
   * non-adjacent pair lands on whoever sits between them. Children with no recorded marriage drop
   * from under the shared parent.
   */
  const anchorOf = (
    node: FamilyNode,
    holderX: number,
    partnerXs: Map<string, number>,
    partnerId: string | null,
    y: number,
  ): { x: number; y: number } => {
    if (partnerId === null) return { x: holderX, y: y + nodeHeight };

    const index = node.spouses.findIndex((spouse) => spouse.id === partnerId);
    const partnerX = partnerXs.get(partnerId);
    if (partnerX === undefined) return { x: holderX, y: y + nodeHeight };

    return index === 0
      ? { x: (holderX + partnerX) / 2, y: y + avatarSize / 2 }
      : { x: partnerX, y: y + nodeHeight };
  };

  const boxes: LaidOutMember[] = [];
  const connectors: Connector[] = [];

  /** Room above the first row for the raised bars of any second or later marriage. */
  const deepestMarriage = (nodes: FamilyNode[]): number =>
    nodes.reduce(
      (most, node) =>
        Math.max(most, node.spouses.length - 1, deepestMarriage(node.children)),
      0,
    );
  const topRoom = Math.max(0, deepestMarriage(roots)) * RAISED_BAR_STEP;

  const rowY = (depth: number) => padding + topRoom + depth * (nodeHeight + levelGap);

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

    const step = nodeWidth + spouseGap;
    const rowStart = centreX - (node.spouses.length * step) / 2;
    const barY = y + avatarSize / 2;

    // Holder first, then each partner in marriage order.
    const holderX = rowStart;
    boxes.push({ member: node.member, x: holderX, y, isSpouse: false, ...own });

    const partnerXs = new Map<string, number>();

    node.spouses.forEach((spouse, index) => {
      const x = rowStart + step * (index + 1);
      partnerXs.set(spouse.id, x);
      boxes.push({ member: spouse, x, y, isSpouse: true, ...partner });

      /*
       * The first marriage gets the classic bar between the two avatars. Later ones are drawn as
       * arcs *above* the heads, back to the shared parent.
       *
       * Two earlier attempts both failed on a third partner. Chaining each bar to the previous box
       * made it look like two wives were married to each other. Putting the shared parent in the
       * middle fixed exactly two, then broke again at three, because the midpoint of a
       * non-adjacent pair lands squarely on whoever sits between them — so that marriage's children
       * descended out of another wife's head. A raised bar has no midpoint to collide with.
       */
      connectors.push({
        kind: 'spouse',
        points:
          index === 0
            ? [
                { x: holderX, y: barY },
                { x, y: barY },
              ]
            : [
                { x: holderX, y: barY },
                { x: holderX, y: y - RAISED_BAR_STEP * index },
                { x, y: y - RAISED_BAR_STEP * index },
                { x, y },
              ],
      });
    });

    if (node.children.length === 0) return;

    const ordered = orderedChildren(node);
    const childrenWidth = ordered.reduce(
      (total, child, index) => total + widthOf(child) + (index > 0 ? siblingGap : 0),
      0,
    );

    let cursor = left + (width - childrenWidth) / 2;
    const centreOf = new Map<string, number>();

    for (const child of ordered) {
      const childWidth = widthOf(child);
      place(child, cursor, depth + 1);
      centreOf.set(child.member.id, cursor + childWidth / 2);
      cursor += childWidth + siblingGap;
    }

    const busY = y + nodeHeight + levelGap / 2;
    const childTopY = rowY(depth + 1);

    for (const group of childGroups(node)) {
      const centres = group.children.map((child) => centreOf.get(child.member.id) ?? 0);
      const anchor = anchorOf(node, holderX, partnerXs, group.partnerId, y);
      const from = anchor.x;

      connectors.push({
        kind: 'descent',
        points: [
          { x: from, y: anchor.y },
          { x: from, y: busY },
        ],
      });

      // One horizontal run across the group, then a drop into each. A single child needs no run,
      // and drawing a zero-length one leaves a visible dot at the join.
      const span = [Math.min(...centres, from), Math.max(...centres, from)];
      if (span[1] - span[0] > 0) {
        connectors.push({
          kind: 'descent',
          points: [
            { x: span[0], y: busY },
            { x: span[1], y: busY },
          ],
        });
      }

      for (const centre of centres) {
        connectors.push({
          kind: 'descent',
          points: [
            { x: centre, y: busY },
            { x: centre, y: childTopY },
          ],
        });
      }
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
