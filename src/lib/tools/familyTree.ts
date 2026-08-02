import { z } from 'zod';
import { randomUUID } from '../platform/randomUtils';

/**
 * A family tree as a flat list of members, each pointing at one parent.
 *
 * Flat storage rather than nested children, because every operation the tool offers — rename,
 * re-parent, delete, import — is a lookup by id, and a nested shape turns each of those into a
 * recursive rewrite. The nesting is derived on read by `buildHierarchy`.
 */
export type Gender = 'male' | 'female' | 'unknown';

export const GENDERS: readonly Gender[] = ['unknown', 'male', 'female'];

export interface FamilyMember {
  id: string;
  name: string;
  /** `null` marks a root. Ids that point at nobody are surfaced by `buildHierarchy`, not dropped. */
  parentId: string | null;
  /**
   * The partner drawn beside this member, with their children hanging from the pair.
   *
   * Symmetric — both sides carry the link. Only a partner who has no parent of their own is drawn
   * beside someone; a partner who is themselves a descendant stays under their own parent, because
   * a tree cannot put one person in two places at once.
   */
  spouseId: string | null;
  /**
   * Drives the shape and colour in the diagram.
   *
   * A field rather than a guess from `relationship`: that is free text, and reading "ลูกสาว" out
   * of it works right up until someone writes "ลูก" or "ลูกคนโต", at which point the diagram is
   * confidently wrong with nothing on screen to explain why.
   */
  gender: Gender;
  /** How this member relates to their parent — "ลูกชาย", "ภรรยา". Free text; presets are a UI concern. */
  relationship: string;
  /** Birth year, occupation, anything the owner wants to remember. */
  note: string;
}

export interface FamilyNode {
  member: FamilyMember;
  /** The married-in partner sharing this node's slot, if any. Has no children of their own. */
  spouse: FamilyMember | null;
  depth: number;
  children: FamilyNode[];
  /** Set by `collapseHierarchy` when this node's branch is folded away. */
  hiddenDescendants?: number;
}

export interface Hierarchy {
  roots: FamilyNode[];
  /** Members whose `parentId` names someone absent from the list. Shown as roots so nobody vanishes. */
  orphanedIds: string[];
  /** Members caught in a parent cycle. Also shown as roots, for the same reason. */
  cycleIds: string[];
}

export const RELATIONSHIP_PRESETS = [
  'พ่อ',
  'แม่',
  'สามี',
  'ภรรยา',
  'ลูกชาย',
  'ลูกสาว',
  'พี่ชาย',
  'พี่สาว',
  'น้องชาย',
  'น้องสาว',
  'ปู่',
  'ย่า',
  'ตา',
  'ยาย',
  'ลุง',
  'ป้า',
  'น้า',
  'อา',
  'หลาน',
] as const;

const memberSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  // Optional as well as nullable: a hand-written import that simply omits the key means a root.
  parentId: z.string().nullable().optional(),
  spouseId: z.string().nullable().optional(),
  // Anything unrecognised reads as unknown rather than failing the whole import for one bad cell.
  gender: z.enum(['male', 'female', 'unknown']).catch('unknown').optional(),
  relationship: z.string(),
  note: z.string(),
});

/**
 * Fills in what the schema allows to be absent.
 *
 * This project compiles without `strictNullChecks`, so the type zod infers for an optional
 * nullable key is `parentId?: string` — which will not sit in a `FamilyMember[]` on its own.
 * Rebuilding each member here settles that without a cast, and does the normalising the import
 * path wanted anyway.
 */
const toMembers = (parsed: z.infer<typeof familyMembersSchema>): FamilyMember[] =>
  parsed.map((entry) => ({
    id: entry.id,
    name: entry.name,
    parentId: entry.parentId ?? null,
    spouseId: entry.spouseId ?? null,
    gender: entry.gender ?? 'unknown',
    relationship: entry.relationship,
    note: entry.note,
  }));

export const familyMembersSchema = z.array(memberSchema);

/** Validates and normalises in one step, for callers holding an unvalidated tree. */
export const normalizeMembers = (parsed: unknown): FamilyMember[] => {
  const result = familyMembersSchema.safeParse(parsed);
  return result.success ? toMembers(result.data) : [];
};

export interface CreateMemberInput {
  name: string;
  parentId?: string | null;
  /** Marries the new member to this one, so the pair is drawn together. */
  spouseId?: string | null;
  gender?: Gender;
  relationship?: string;
  note?: string;
}

export const createMember = (input: CreateMemberInput): FamilyMember => ({
  id: randomUUID(),
  name: input.name.trim(),
  parentId: input.parentId ?? null,
  spouseId: input.spouseId ?? null,
  gender: input.gender ?? 'unknown',
  relationship: input.relationship?.trim() ?? '',
  note: input.note?.trim() ?? '',
});

/**
 * Appends a member that has already been built.
 *
 * Split from `addMember` so a caller can hold on to the id: adding from the diagram selects the new
 * member and focuses their name field, which needs the id before the state update lands.
 */
export const appendMember = (
  members: FamilyMember[],
  member: FamilyMember,
): FamilyMember[] => {
  const withMember = [...members, member];

  // The link is symmetric, so the partner has to learn about it too — otherwise the pair renders
  // from one side only and unlinking from the other side silently does nothing.
  return member.spouseId
    ? updateMember(withMember, member.spouseId, { spouseId: member.id })
    : withMember;
};

export const addMember = (members: FamilyMember[], input: CreateMemberInput): FamilyMember[] =>
  appendMember(members, createMember(input));

export const updateMember = (
  members: FamilyMember[],
  id: string,
  patch: Partial<Omit<FamilyMember, 'id'>>,
): FamilyMember[] => members.map((member) => (member.id === id ? { ...member, ...patch } : member));

/**
 * Removes one member and lifts their children to the removed member's parent.
 *
 * Deleting the subtree would be the other option, and it is the wrong default here: someone
 * removing a duplicate entry halfway up a tree they spent an hour building would lose every
 * descendant to a single click, with the loss invisible until they scrolled.
 */
export const removeMember = (members: FamilyMember[], id: string): FamilyMember[] => {
  const removed = members.find((member) => member.id === id);
  if (!removed) return members;

  return members
    .filter((member) => member.id !== id)
    .map((member) => {
      const lifted = member.parentId === id ? removed.parentId : member.parentId;
      // A dangling spouseId would draw a partner bar to somebody who is no longer there.
      const stillMarried = member.spouseId === id ? null : member.spouseId;

      return { ...member, parentId: lifted, spouseId: stillMarried };
    });
};

/**
 * Marries two members, or with `null` ends a marriage.
 *
 * Both sides are written every time. Someone can only be drawn beside one partner, so marrying an
 * already-married member first releases the previous one rather than leaving a half-link pointing
 * at a partner who has moved on.
 */
export const linkSpouse = (
  members: FamilyMember[],
  id: string,
  spouseId: string | null,
): ReparentResult => {
  const member = members.find((entry) => entry.id === id);
  if (!member) return { ok: false, reason: 'That member is no longer in the tree.' };

  if (spouseId === id) return { ok: false, reason: 'Someone cannot marry themselves.' };

  const clearOldLinks = (list: FamilyMember[]) =>
    list.map((entry) => {
      if (entry.id === member.spouseId && entry.id !== spouseId) return { ...entry, spouseId: null };
      return entry;
    });

  if (spouseId === null) {
    return { ok: true, members: updateMember(clearOldLinks(members), id, { spouseId: null }) };
  }

  const partner = members.find((entry) => entry.id === spouseId);
  if (!partner) return { ok: false, reason: 'That partner is no longer in the tree.' };

  if (partner.parentId === id || member.parentId === spouseId) {
    return { ok: false, reason: 'A parent and their child cannot be partners.' };
  }

  const released = clearOldLinks(members).map((entry) =>
    entry.id === partner.spouseId && entry.id !== id ? { ...entry, spouseId: null } : entry,
  );

  return {
    ok: true,
    members: updateMember(updateMember(released, id, { spouseId }), spouseId, { spouseId: id }),
  };
};

/** Every id on the parent chain above `id`, nearest first. Stops on a cycle rather than hanging. */
export const ancestorIdsOf = (members: FamilyMember[], id: string): string[] => {
  const byId = new Map(members.map((member) => [member.id, member]));
  const seen = new Set<string>([id]);
  const ancestors: string[] = [];

  let current = byId.get(id)?.parentId ?? null;
  while (current !== null && !seen.has(current)) {
    seen.add(current);
    ancestors.push(current);
    current = byId.get(current)?.parentId ?? null;
  }

  return ancestors;
};

export interface FamilyFailure {
  ok: false;
  reason: string;
}

/**
 * Narrows to the failure arm.
 *
 * Without `strictNullChecks` — which this project does not enable — TypeScript will narrow a
 * discriminated union on the `true` side (`if (result.ok) { … }`) but not on the `false` side, so
 * `if (!result.ok) toast.error(result.reason)` does not compile. An explicit guard says the same
 * thing and works either way.
 */
export const isFamilyFailure = (result: { ok: boolean }): result is FamilyFailure => !result.ok;

export type ReparentResult = { ok: true; members: FamilyMember[] } | FamilyFailure;

/**
 * Re-parents a member, refusing the moves that would break the tree.
 *
 * The cycle check is the reason this returns a result instead of a list: dropping a member onto
 * their own descendant is an easy mistake in a drag-free UI built from dropdowns, and the damage
 * is a subtree that disappears from every root at once.
 */
export const reparentMember = (
  members: FamilyMember[],
  id: string,
  parentId: string | null,
): ReparentResult => {
  const member = members.find((entry) => entry.id === id);
  if (!member) return { ok: false, reason: 'That member is no longer in the tree.' };

  if (parentId === id) return { ok: false, reason: 'Someone cannot be their own parent.' };

  if (parentId !== null) {
    if (!members.some((entry) => entry.id === parentId)) {
      return { ok: false, reason: 'That parent is no longer in the tree.' };
    }

    if (ancestorIdsOf(members, parentId).includes(id)) {
      return { ok: false, reason: 'That would put someone below their own descendant.' };
    }
  }

  return { ok: true, members: updateMember(members, id, { parentId }) };
};

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

export const serializeFamily = (members: FamilyMember[]): string =>
  JSON.stringify(members, null, 2);

export type ParseFamilyResult = { ok: true; members: FamilyMember[] } | FamilyFailure;

/**
 * Reads an exported file back. Rejects rather than repairs: a partly-understood family tree that
 * silently drops the rows it could not read is the failure worth avoiding here.
 */
export const parseFamily = (raw: string): ParseFamilyResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'That is not valid JSON.' };
  }

  const result = familyMembersSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, reason: 'That JSON is not a family tree export.' };
  }

  const ids = new Set(result.data.map((member) => member.id));
  if (ids.size !== result.data.length) {
    return { ok: false, reason: 'That export has two members sharing an id.' };
  }

  return { ok: true, members: toMembers(result.data) };
};
