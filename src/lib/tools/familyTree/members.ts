import { randomUUID } from '../../platform/randomUtils';
import type { CreateMemberInput, FamilyMember, MembersResult } from './types';

/**
 * Every change to the flat list of members, as a pure function from list to list.
 *
 * Nothing here derives the tree shape — that is `hierarchy.ts`, which reads these results. The
 * operations that can be refused return a `MembersResult` rather than throwing or silently doing
 * nothing, because the refusals are ordinary user mistakes with an explanation attached.
 */

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
): MembersResult => {
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
): MembersResult => {
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
