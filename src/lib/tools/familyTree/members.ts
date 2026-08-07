import { randomUUID } from '../../platform/randomUtils';
import { byBirthYear } from './lifeDates';
import type { CreateMemberInput, FamilyMember, MembersResult } from './types';

/**
 * Moves a member one place among their own siblings.
 *
 * Sibling order was the order people happened to be entered, permanently: someone who remembered
 * the youngest first left them on the left forever. Birth order is a real fact about a family, and
 * a family tree is conventionally read eldest to youngest.
 *
 * Only siblings swap. Moving within the whole list would slide a member past unrelated people and
 * change nothing visible, since the diagram groups by parent.
 */
export const moveMember = (
  members: FamilyMember[],
  id: string,
  direction: -1 | 1,
): FamilyMember[] => {
  const from = members.findIndex((entry) => entry.id === id);
  if (from === -1) return members;

  const siblingIndexes = members
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.parentId === members[from].parentId)
    .map(({ index }) => index);

  const target = siblingIndexes[siblingIndexes.indexOf(from) + direction];
  if (target === undefined) return members;

  const next = [...members];
  [next[from], next[target]] = [next[target], next[from]];

  return next;
};

/**
 * Reorders one member's children by birth year, oldest first.
 *
 * Offered rather than applied automatically. Sorting the moment a date is typed would rearrange the
 * diagram under someone mid-edit, and a tree with half its dates filled in would shuffle on every
 * entry. Children keep their slots in the flat list, so nobody else moves.
 */
export const sortChildrenByBirth = (
  members: FamilyMember[],
  parentId: string | null,
): FamilyMember[] => {
  const children = members
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.parentId === parentId);

  const sorted = [...children].sort((left, right) => byBirthYear(left.entry, right.entry));

  const next = [...members];
  children.forEach(({ index }, slot) => {
    next[index] = sorted[slot].entry;
  });

  return next;
};

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
  spouseIds: input.spouseId ? [input.spouseId] : [],
  otherParentId: input.otherParentId ?? null,
  gender: input.gender ?? 'unknown',
  relationship: input.relationship?.trim() ?? '',
  birth: input.birth?.trim() ?? '',
  death: input.death?.trim() ?? '',
  note: input.note?.trim() ?? '',
});

/**
 * Appends a member that has already been built.
 *
 * Split from `addMember` so a caller can hold on to the id: adding from the diagram selects the new
 * member and focuses their name field, which needs the id before the state update lands.
 */
export const appendMember = (members: FamilyMember[], member: FamilyMember): FamilyMember[] => {
  const withMember = [...members, member];
  const partnerId = member.spouseIds[0];
  if (!partnerId) return withMember;

  // The link is symmetric, so the partner has to learn about it too — otherwise the pair renders
  // from one side only and unlinking from the other side silently does nothing.
  return withMember.map((entry) =>
    entry.id === partnerId ? { ...entry, spouseIds: [...entry.spouseIds, member.id] } : entry,
  );
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
    .map((member) => ({
      ...member,
      parentId: member.parentId === id ? removed.parentId : member.parentId,
      // A dangling link would draw a partner bar to somebody who is no longer there, and leave
      // children attributed to a second parent that does not exist.
      spouseIds: member.spouseIds.filter((entry) => entry !== id),
      otherParentId: member.otherParentId === id ? null : member.otherParentId,
    }));
};

/**
 * Adds a marriage. Both sides are written, and nobody is married twice to the same person.
 *
 * A list rather than a single slot, so a second marriage can be recorded at all. With one slot the
 * only way to add a new partner was to drop the previous one, which quietly rewrote history: the
 * children of the first marriage were left attributed to a couple that no longer existed.
 */
export const linkSpouse = (
  members: FamilyMember[],
  id: string,
  spouseId: string,
): MembersResult => {
  const member = members.find((entry) => entry.id === id);
  if (!member) return { ok: false, reason: 'That member is no longer in the tree.' };

  if (spouseId === id) return { ok: false, reason: 'Someone cannot marry themselves.' };

  const partner = members.find((entry) => entry.id === spouseId);
  if (!partner) return { ok: false, reason: 'That partner is no longer in the tree.' };

  if (partner.parentId === id || member.parentId === spouseId) {
    return { ok: false, reason: 'A parent and their child cannot be partners.' };
  }

  if (member.spouseIds.includes(spouseId)) {
    return { ok: false, reason: 'They are already partners.' };
  }

  const withLink = (entry: FamilyMember, otherId: string) =>
    entry.spouseIds.includes(otherId)
      ? entry
      : { ...entry, spouseIds: [...entry.spouseIds, otherId] };

  return {
    ok: true,
    members: members.map((entry) => {
      if (entry.id === id) return withLink(entry, spouseId);
      if (entry.id === spouseId) return withLink(entry, id);
      return entry;
    }),
  };
};

/**
 * Ends a marriage from either side, and releases any children attributed to that pairing.
 *
 * Leaving `otherParentId` pointing at a former partner would keep those children hanging off a bar
 * that is no longer drawn, which puts them nowhere.
 */
export const unlinkSpouse = (
  members: FamilyMember[],
  id: string,
  spouseId: string,
): FamilyMember[] =>
  members.map((entry) => {
    const stillMarried = entry.spouseIds.filter((candidate) =>
      entry.id === id ? candidate !== spouseId : entry.id === spouseId ? candidate !== id : true,
    );

    const orphanedAttribution =
      (entry.parentId === id && entry.otherParentId === spouseId) ||
      (entry.parentId === spouseId && entry.otherParentId === id);

    return {
      ...entry,
      spouseIds: stillMarried,
      otherParentId: orphanedAttribution ? null : entry.otherParentId,
    };
  });

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
