import { describe, expect, it } from 'vitest';
import {
  addMember,
  ancestorIdsOf,
  buildHierarchy,
  collapseHierarchy,
  countDescendants,
  countGenerations,
  createMember,
  flattenHierarchy,
  linkSpouse,
  parseFamily,
  removeMember,
  reparentMember,
  serializeFamily,
  updateMember,
  type FamilyMember,
} from './familyTree';

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

describe('buildHierarchy', () => {
  it('nests members under their parent', () => {
    const { roots } = buildHierarchy(family());

    expect(roots).toHaveLength(1);
    expect(roots[0].member.id).toBe('grandpa');
    expect(roots[0].children.map((child) => child.member.id)).toEqual(['dad', 'uncle']);
    expect(roots[0].children[0].children.map((child) => child.member.id)).toEqual([
      'me',
      'sister',
    ]);
  });

  it('records depth from the root', () => {
    const { roots } = buildHierarchy(family());

    expect(roots[0].depth).toBe(0);
    expect(roots[0].children[0].depth).toBe(1);
    expect(roots[0].children[0].children[0].depth).toBe(2);
  });

  it('handles an empty tree', () => {
    expect(buildHierarchy([])).toEqual({ roots: [], orphanedIds: [], cycleIds: [] });
  });

  it('shows a member whose parent is missing as a root and names them', () => {
    const broken = [member('grandpa', null), member('lost', 'deleted-parent')];
    const { roots, orphanedIds } = buildHierarchy(broken);

    expect(orphanedIds).toEqual(['lost']);
    expect(roots.map((node) => node.member.id)).toEqual(['grandpa', 'lost']);
  });

  it('lifts both members of a parent cycle to roots, each shown once', () => {
    const { roots, cycleIds } = buildHierarchy([member('a', 'b'), member('b', 'a')]);

    expect(cycleIds).toEqual(['a', 'b']);
    expect(roots.map((node) => node.member.id)).toEqual(['a', 'b']);
    expect(flattenHierarchy(roots).map((node) => node.member.id)).toEqual(['a', 'b']);
  });

  it('keeps a member below a cycle attached to their parent, not lifted with it', () => {
    const withCycle = [member('a', 'b'), member('b', 'a'), member('child', 'a')];
    const { roots, cycleIds } = buildHierarchy(withCycle);

    // 'child' can never reach a root, but its own parent link was never in doubt.
    expect(cycleIds).toEqual(['a', 'b']);
    expect(roots.map((node) => node.member.id)).toEqual(['a', 'b']);
    expect(roots[0].children.map((node) => node.member.id)).toEqual(['child']);
    expect(flattenHierarchy(roots)).toHaveLength(3);
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

  it('round-trips the partner link through export and import', () => {
    const result = parseFamily(serializeFamily(married()));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.members[0].spouseId).toBe('gm');
  });
});

describe('collapseHierarchy', () => {
  it('leaves an uncollapsed tree exactly as it was', () => {
    const { roots } = buildHierarchy(family());

    expect(collapseHierarchy(roots, new Set())).toEqual(roots);
  });

  it('drops the children of a folded node and counts who went with them', () => {
    const { roots } = buildHierarchy(family());
    const folded = collapseHierarchy(roots, new Set(['dad']));
    const dad = folded[0].children.find((node) => node.member.id === 'dad');

    expect(dad?.children).toEqual([]);
    expect(dad?.hiddenDescendants).toBe(2);
    // The fold is local: the uncle beside them is untouched.
    expect(folded[0].children.map((node) => node.member.id)).toEqual(['dad', 'uncle']);
  });

  it('counts the whole branch, not just the first generation', () => {
    const deep = [
      member('a', null),
      member('b', 'a'),
      member('c', 'b'),
      member('d', 'c'),
    ];
    const folded = collapseHierarchy(buildHierarchy(deep).roots, new Set(['a']));

    expect(folded[0].hiddenDescendants).toBe(3);
  });

  it('ignores a fold on someone with no children rather than marking them folded', () => {
    const { roots } = buildHierarchy(family());
    const folded = collapseHierarchy(roots, new Set(['uncle']));
    const uncle = folded[0].children.find((node) => node.member.id === 'uncle');

    // A count of zero beside a leaf invites a click that does nothing.
    expect(uncle?.hiddenDescendants).toBeUndefined();
  });

  it('folds nested branches independently', () => {
    const { roots } = buildHierarchy(family());
    const folded = collapseHierarchy(roots, new Set(['grandpa', 'dad']));

    expect(folded[0].children).toEqual([]);
    expect(folded[0].hiddenDescendants).toBe(4);
  });

  it('does not mutate the hierarchy it was given', () => {
    const { roots } = buildHierarchy(family());
    collapseHierarchy(roots, new Set(['dad']));

    expect(roots[0].children[0].children).toHaveLength(2);
  });
});

describe('tree measurements', () => {
  it('counts descendants below a node', () => {
    const { roots } = buildHierarchy(family());

    expect(countDescendants(roots[0])).toBe(4);
    expect(countDescendants(roots[0].children[0])).toBe(2);
    expect(countDescendants(roots[0].children[1])).toBe(0);
  });

  it('counts generations, with a lone root counting as one', () => {
    expect(countGenerations(buildHierarchy(family()).roots)).toBe(3);
    expect(countGenerations(buildHierarchy([member('solo', null)]).roots)).toBe(1);
    expect(countGenerations([])).toBe(0);
  });

  it('flattens parents immediately above their children', () => {
    const flat = flattenHierarchy(buildHierarchy(family()).roots);

    expect(flat.map((node) => node.member.id)).toEqual([
      'grandpa',
      'dad',
      'me',
      'sister',
      'uncle',
    ]);
  });
});

describe('serializeFamily and parseFamily', () => {
  it('round-trips a tree', () => {
    const result = parseFamily(serializeFamily(family()));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.members).toEqual(family());
  });

  it('rejects text that is not JSON', () => {
    expect(parseFamily('not json')).toEqual({
      ok: false,
      reason: 'That is not valid JSON.',
    });
  });

  it('rejects JSON of the wrong shape rather than importing part of it', () => {
    expect(parseFamily('{"members":[]}').ok).toBe(false);
    expect(parseFamily('[{"name":"no id"}]').ok).toBe(false);
  });

  it('rejects an export with duplicate ids', () => {
    const duplicated = serializeFamily([member('same', null), member('same', null)]);

    expect(parseFamily(duplicated)).toEqual({
      ok: false,
      reason: 'That export has two members sharing an id.',
    });
  });

  it('reads a member with no parentId key as a root', () => {
    const result = parseFamily('[{"id":"a","name":"A","relationship":"","note":""}]');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.members[0].parentId).toBeNull();
  });

  it('accepts an empty tree', () => {
    expect(parseFamily('[]')).toEqual({ ok: true, members: [] });
  });
});
