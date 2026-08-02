import { describe, expect, it } from 'vitest';
import {
  addMember,
  ancestorIdsOf,
  createMember,
  linkSpouse,
  removeMember,
  reparentMember,
  updateMember,
} from './members';
import { buildHierarchy } from './hierarchy';
import type { FamilyMember } from './types';

/** Fixed ids keep the assertions readable — `createMember` would hand out random ones. */
const member = (
  id: string,
  parentId: string | null,
  overrides: Partial<FamilyMember> = {},
): FamilyMember => ({
  id,
  name: id,
  parentId,
  spouseId: null,
  gender: 'unknown',
  relationship: '',
  note: '',
  ...overrides,
});

/**
 *   grandpa
 *   ├── dad
 *   │   ├── me
 *   │   └── sister
 *   └── uncle
 */
const family = (): FamilyMember[] => [
  member('grandpa', null),
  member('dad', 'grandpa', { relationship: 'ลูกชาย' }),
  member('me', 'dad', { relationship: 'ลูกชาย' }),
  member('sister', 'dad', { relationship: 'ลูกสาว' }),
  member('uncle', 'grandpa', { relationship: 'ลูกชาย' }),
];

describe('createMember', () => {
  it('trims what the form hands over', () => {
    const created = createMember({ name: '  สมชาย  ', relationship: ' พ่อ ', note: ' 2500 ' });

    expect(created.name).toBe('สมชาย');
    expect(created.relationship).toBe('พ่อ');
    expect(created.note).toBe('2500');
  });

  it('defaults to a root with no relationship', () => {
    const created = createMember({ name: 'ฉัน' });

    expect(created.parentId).toBeNull();
    expect(created.relationship).toBe('');
    expect(created.id).not.toHaveLength(0);
  });

  it('gives each member a distinct id', () => {
    const ids = new Set([createMember({ name: 'a' }).id, createMember({ name: 'a' }).id]);

    expect(ids.size).toBe(2);
  });
});

describe('addMember and updateMember', () => {
  it('appends without touching the existing list', () => {
    const before = family();
    const after = addMember(before, { name: 'baby', parentId: 'me' });

    expect(before).toHaveLength(5);
    expect(after).toHaveLength(6);
    expect(after[5].name).toBe('baby');
  });

  it('patches one member and leaves the rest alone', () => {
    const after = updateMember(family(), 'me', { name: 'renamed' });

    expect(after.find((entry) => entry.id === 'me')?.name).toBe('renamed');
    expect(after.find((entry) => entry.id === 'sister')?.name).toBe('sister');
  });
});

describe('removeMember', () => {
  it('lifts the children of the removed member to their grandparent', () => {
    const after = removeMember(family(), 'dad');

    expect(after.map((entry) => entry.id)).not.toContain('dad');
    expect(after.find((entry) => entry.id === 'me')?.parentId).toBe('grandpa');
    expect(after.find((entry) => entry.id === 'sister')?.parentId).toBe('grandpa');
  });

  it('turns the children of a removed root into roots rather than losing them', () => {
    const after = removeMember(family(), 'grandpa');

    expect(after).toHaveLength(4);
    expect(after.find((entry) => entry.id === 'dad')?.parentId).toBeNull();
  });

  it('ignores an id that is not in the tree', () => {
    expect(removeMember(family(), 'nobody')).toHaveLength(5);
  });
});

describe('ancestorIdsOf', () => {
  it('walks up to the root, nearest first', () => {
    expect(ancestorIdsOf(family(), 'me')).toEqual(['dad', 'grandpa']);
  });

  it('returns nothing for a root', () => {
    expect(ancestorIdsOf(family(), 'grandpa')).toEqual([]);
  });

  it('stops on a cycle instead of hanging', () => {
    const looped = [member('a', 'b'), member('b', 'a')];

    expect(ancestorIdsOf(looped, 'a')).toEqual(['b']);
  });
});

describe('reparentMember', () => {
  it('moves a member under a new parent', () => {
    const result = reparentMember(family(), 'me', 'uncle');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.members.find((entry) => entry.id === 'me')?.parentId).toBe('uncle');
  });

  it('promotes a member to a root', () => {
    const result = reparentMember(family(), 'dad', null);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.members.find((entry) => entry.id === 'dad')?.parentId).toBeNull();
  });

  it('refuses to make someone their own parent', () => {
    const result = reparentMember(family(), 'me', 'me');

    expect(result.ok).toBe(false);
  });

  it('refuses a move that would put a member below their own descendant', () => {
    expect(reparentMember(family(), 'grandpa', 'me')).toEqual({
      ok: false,
      reason: 'That would put someone below their own descendant.',
    });
  });

  it('refuses a parent that is not in the tree', () => {
    const result = reparentMember(family(), 'me', 'ghost');

    expect(result.ok).toBe(false);
  });
});

describe('spouses', () => {
  const married = (): FamilyMember[] => [
    member('gp', null, { spouseId: 'gm' }),
    member('gm', null, { spouseId: 'gp' }),
    member('dad', 'gp'),
  ];

  it('writes both sides when a member is added as a partner', () => {
    const after = addMember([member('gp', null)], { name: 'gm', spouseId: 'gp' });
    const gm = after.find((entry) => entry.name === 'gm');

    expect(gm?.spouseId).toBe('gp');
    expect(after.find((entry) => entry.id === 'gp')?.spouseId).toBe(gm?.id);
  });

  it('hangs the partner off the node instead of giving them their own root', () => {
    const { roots } = buildHierarchy(married());

    expect(roots).toHaveLength(1);
    expect(roots[0].member.id).toBe('gp');
    expect(roots[0].spouse?.id).toBe('gm');
  });

  it('keeps the partner who has a parent in their own place', () => {
    // A descendant cannot give up their slot — the tree would have to draw them twice.
    const withDescendant = [
      member('gp', null),
      member('dad', 'gp', { spouseId: 'mum' }),
      member('mum', null, { spouseId: 'dad' }),
    ];
    const { roots } = buildHierarchy(withDescendant);

    expect(roots).toHaveLength(1);
    expect(roots[0].children[0].member.id).toBe('dad');
    expect(roots[0].children[0].spouse?.id).toBe('mum');
  });

  it('gives the slot to whoever was added first when neither partner has a parent', () => {
    const { roots } = buildHierarchy(married());

    // Without a tie-break both would attach to the other and neither would be drawn.
    expect(roots.map((node) => node.member.id)).toEqual(['gp']);
  });

  it('ignores a one-sided link rather than drawing half a couple', () => {
    const lopsided = [member('gp', null), member('gm', null, { spouseId: 'gp' })];
    const { roots } = buildHierarchy(lopsided);

    expect(roots).toHaveLength(2);
    expect(roots[0].spouse).toBeNull();
  });

  it('children of a couple hang from the partner holding the slot', () => {
    const { roots } = buildHierarchy(married());

    expect(roots[0].children.map((child) => child.member.id)).toEqual(['dad']);
  });

  it('links both sides and refuses a parent marrying their own child', () => {
    const linked = linkSpouse([member('a', null), member('b', null)], 'a', 'b');

    expect(linked.ok).toBe(true);
    if (linked.ok) {
      expect(linked.members.find((entry) => entry.id === 'b')?.spouseId).toBe('a');
    }

    expect(linkSpouse([member('a', null), member('kid', 'a')], 'a', 'kid')).toEqual({
      ok: false,
      reason: 'A parent and their child cannot be partners.',
    });
  });

  it('refuses to marry someone to themselves', () => {
    expect(linkSpouse([member('a', null)], 'a', 'a')).toEqual({
      ok: false,
      reason: 'Someone cannot marry themselves.',
    });
  });

  it('releases the previous partner rather than leaving a half-link', () => {
    const result = linkSpouse(married(), 'gp', 'other');

    // 'other' is not in the tree, so nothing should have changed.
    expect(result.ok).toBe(false);

    const remarried = linkSpouse([...married(), member('new', null)], 'gp', 'new');
    expect(remarried.ok).toBe(true);
    if (!remarried.ok) return;

    expect(remarried.members.find((entry) => entry.id === 'gm')?.spouseId).toBeNull();
    expect(remarried.members.find((entry) => entry.id === 'new')?.spouseId).toBe('gp');
  });

  it('unlinks both sides', () => {
    const result = linkSpouse(married(), 'gp', null);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.members.find((entry) => entry.id === 'gp')?.spouseId).toBeNull();
    expect(result.members.find((entry) => entry.id === 'gm')?.spouseId).toBeNull();
  });

  it('clears the partner link when a member is removed', () => {
    const after = removeMember(married(), 'gm');

    expect(after.find((entry) => entry.id === 'gp')?.spouseId).toBeNull();
  });

});
