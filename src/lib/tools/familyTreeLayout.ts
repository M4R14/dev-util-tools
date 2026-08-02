import { flattenHierarchy, type FamilyMember, type FamilyNode } from './familyTree';

/**
 * Positions for a family tree drawn in three dimensions.
 *
 * Generations stack downward on Y, and each generation wraps onto a circle in the X–Z plane
 * instead of running off to the sides. That is the reason to render this in 3D at all: a flat tree
 * grows as wide as its widest generation, so eight cousins push their grandparents off the screen,
 * while a ring of the same eight stays the same size from every angle.
 *
 * Angles come from a single ordering shared by every generation, so a parent sits directly above
 * the arc its children occupy and the edges stay short.
 */
export interface PositionedMember {
  member: FamilyMember;
  depth: number;
  x: number;
  y: number;
  z: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export interface FamilyLayout3D {
  nodes: PositionedMember[];
  edges: LayoutEdge[];
  /** Radius of the widest ring, for framing the camera. */
  radius: number;
  /** Distance from the top generation to the bottom, for framing the camera. */
  height: number;
}

export interface Layout3DOptions {
  /** Vertical distance between one generation and the next. */
  levelHeight?: number;
  /** Arc length reserved for each member on a ring. Larger values push crowded rings outward. */
  arcSpacing?: number;
  /** How much wider each generation's ring is than the one above it. */
  ringGap?: number;
}

const DEFAULTS: Required<Layout3DOptions> = {
  levelHeight: 2.4,
  arcSpacing: 2.8,
  ringGap: 2.6,
};

/**
 * Gives every leaf its own slot and centres each parent over the slots of its children.
 *
 * Slots are fractional for parents on purpose — rounding a parent to a whole slot would drag it
 * off the middle of its children whenever it had an even number of them.
 */
const assignSlots = (roots: FamilyNode[]): { slots: Map<string, number>; total: number } => {
  const slots = new Map<string, number>();
  let nextLeaf = 0;

  const place = (node: FamilyNode): number => {
    if (node.children.length === 0) {
      const slot = nextLeaf;
      nextLeaf += 1;
      slots.set(node.member.id, slot);
      return slot;
    }

    const childSlots = node.children.map(place);
    const slot = (childSlots[0] + childSlots[childSlots.length - 1]) / 2;
    slots.set(node.member.id, slot);
    return slot;
  };

  roots.forEach(place);

  return { slots, total: nextLeaf };
};

export const layoutFamilyTree3D = (
  roots: FamilyNode[],
  options: Layout3DOptions = {},
): FamilyLayout3D => {
  const { levelHeight, arcSpacing, ringGap } = { ...DEFAULTS, ...options };
  const flat = flattenHierarchy(roots);

  if (flat.length === 0) {
    return { nodes: [], edges: [], radius: 0, height: 0 };
  }

  const { slots, total } = assignSlots(roots);

  const countAtDepth = new Map<number, number>();
  for (const node of flat) {
    countAtDepth.set(node.depth, (countAtDepth.get(node.depth) ?? 0) + 1);
  }

  /**
   * Rings widen with each generation, so the tree is a cone rather than a cylinder.
   *
   * The first version gave every generation the same radius. It rendered, but the oldest ancestor
   * ended up standing on the same ring as their own children — visually just another member of the
   * crowd, distinguishable only by being slightly higher. Fanning outward puts the ancestor at the
   * apex, which is what the diagram is supposed to say.
   *
   * A crowded generation still overrides the cone: enough members on one ring need the
   * circumference regardless of how near the apex they are.
   */
  const radiusAt = (depth: number): number => {
    // A single branch has nothing to spread apart; it stands straight up the axis.
    if (total <= 1) return 0;
    if (depth === 0 && (countAtDepth.get(0) ?? 0) === 1) return 0;

    const crowding = ((countAtDepth.get(depth) ?? 1) * arcSpacing) / (2 * Math.PI);
    return Math.max(depth * ringGap, crowding);
  };

  // Generations descend from here. Subtracting rather than negating also keeps the top row at
  // `+0`: `-(0 * levelHeight)` is `-0`, which is the same point but shows up in any `toEqual` a
  // caller writes later and reads like a bug.
  const TOP_Y = 0;

  const nodes = flat.map((node) => {
    const angle = total <= 1 ? 0 : (2 * Math.PI * (slots.get(node.member.id) ?? 0)) / total;
    const radius = radiusAt(node.depth);

    return {
      member: node.member,
      depth: node.depth,
      x: radius * Math.cos(angle),
      y: TOP_Y - node.depth * levelHeight,
      z: radius * Math.sin(angle),
    };
  });

  const edges: LayoutEdge[] = flat.flatMap((node) =>
    node.children.map((child) => ({ from: node.member.id, to: child.member.id })),
  );

  const deepest = flat.reduce((max, node) => Math.max(max, node.depth), 0);
  const widest = Math.max(...Array.from(countAtDepth.keys()).map(radiusAt), 0);

  return { nodes, edges, radius: widest, height: deepest * levelHeight };
};
