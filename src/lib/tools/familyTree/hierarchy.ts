import type { FamilyMember, FamilyNode, Hierarchy } from './types';

/**
 * Deriving the drawable shape from the flat list, on read.
 *
 * Nothing here mutates: it takes members and answers what the tree looks like right now. That is
 * what lets the renderer and the layout share one description of the tree without either of them
 * being able to disturb it.
 */

/**
 * Derives the nested shape, keeping every member reachable.
 *
 * A member can fail to hang off a root two ways: their parent is missing (an import that lost a
 * row) or the parent chain loops (a hand-edited file). Both are reported and both are rendered as
 * roots, because a family tree that quietly omits people is worse than one that shows a stray
 * branch — the owner can see and fix a stray branch.
 */
export const buildHierarchy = (members: FamilyMember[]): Hierarchy => {
  const byId = new Map(members.map((member) => [member.id, member]));
  const orphanedIds: string[] = [];
  const cycleIds: string[] = [];

  /**
   * True only when the chain above `start` comes back to `start` itself.
   *
   * The distinction matters. "Cannot reach a root" would also be true of every member hanging
   * *below* a loop, and promoting those to roots throws away the one parent link they had that was
   * never in question. Only the members actually on the loop need lifting; their descendants then
   * nest under them as usual.
   *
   * `ancestorIdsOf` cannot answer this either — it seeds `seen` with the starting id and stops the
   * moment it revisits, so for A→B→A it returns `[B]` and the loop never appears in the result.
   */
  const isOnCycle = (start: string): boolean => {
    const seen = new Set<string>();
    let current = byId.get(start)?.parentId ?? null;

    while (current !== null) {
      if (current === start) return true;
      // A loop further up that `start` is not part of. Someone else will be lifted for it.
      if (seen.has(current)) return false;
      seen.add(current);
      current = byId.get(current)?.parentId ?? null;
    }

    return false;
  };

  const isRoot = (member: FamilyMember): boolean => {
    if (member.parentId === null) return true;

    if (!byId.has(member.parentId)) {
      orphanedIds.push(member.id);
      return true;
    }

    if (isOnCycle(member.id)) {
      cycleIds.push(member.id);
      return true;
    }

    return false;
  };

  const indexOf = new Map(members.map((member, index) => [member.id, index]));

  /**
   * True for the partner who gives up their own slot and is drawn beside the other.
   *
   * Only someone with no parent in the tree can do this — a partner who is themselves a descendant
   * belongs under their own parent, and no tree can draw one person in two places. When neither
   * partner has a parent, whichever was added first keeps the slot; without that tie-break the two
   * would each attach to the other and both disappear from the diagram.
   */
  const isMarriedIn = (member: FamilyMember): boolean => {
    if (member.parentId !== null || !member.spouseId) return false;

    const partner = byId.get(member.spouseId);
    if (!partner || partner.spouseId !== member.id) return false;

    if (partner.parentId !== null) return true;
    return (indexOf.get(partner.id) ?? 0) < (indexOf.get(member.id) ?? 0);
  };

  const childrenOf = new Map<string, FamilyMember[]>();
  const rootMembers: FamilyMember[] = [];

  for (const member of members) {
    if (isMarriedIn(member)) continue;

    if (isRoot(member)) {
      rootMembers.push(member);
      continue;
    }

    const siblings = childrenOf.get(member.parentId as string) ?? [];
    siblings.push(member);
    childrenOf.set(member.parentId as string, siblings);
  }

  const spouseOf = (member: FamilyMember): FamilyMember | null => {
    if (!member.spouseId) return null;

    const partner = byId.get(member.spouseId);
    return partner && isMarriedIn(partner) ? partner : null;
  };

  // No visited-set needed: every member is either a root or the child of exactly one member that
  // is not below them, so the descent is a forest and cannot revisit.
  const toNode = (member: FamilyMember, depth: number): FamilyNode => ({
    member,
    spouse: spouseOf(member),
    depth,
    children: (childrenOf.get(member.id) ?? []).map((child) => toNode(child, depth + 1)),
  });

  return { roots: rootMembers.map((member) => toNode(member, 0)), orphanedIds, cycleIds };
};

/**
 * Prunes the branches the reader has folded away, recording how many people went with each.
 *
 * A pure transform over the hierarchy rather than a flag the renderer checks, so the layout never
 * has to know that collapsing exists — it lays out whatever tree it is handed. The count comes back
 * on the node because "12 more" is the only thing that tells the reader a fold is worth opening; a
 * bare chevron hides how much is behind it.
 */
export const collapseHierarchy = (nodes: FamilyNode[], collapsedIds: Set<string>): FamilyNode[] =>
  nodes.map((node) => {
    if (collapsedIds.has(node.member.id) && node.children.length > 0) {
      return { ...node, children: [], hiddenDescendants: countDescendants(node) };
    }

    return { ...node, children: collapseHierarchy(node.children, collapsedIds) };
  });

/** Total members under a node, the node itself excluded. */
export const countDescendants = (node: FamilyNode): number =>
  node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);

/** Deepest generation in the tree, counting a lone root as 1. */
export const countGenerations = (nodes: FamilyNode[]): number =>
  nodes.reduce((deepest, node) => Math.max(deepest, 1 + countGenerations(node.children)), 0);

/** Flattens back to display order — parents immediately above their children. */
export const flattenHierarchy = (nodes: FamilyNode[]): FamilyNode[] =>
  nodes.flatMap((node) => [node, ...flattenHierarchy(node.children)]);
