import { describe, expect, it } from 'vitest';
import {
  buildHierarchy,
  collapseHierarchy,
  countDescendants,
  countGenerations,
  flattenHierarchy,
} from './hierarchy';
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
  spouseIds: [],
  otherParentId: null,
  gender: 'unknown',
  relationship: '',
  birth: '',
  death: '',
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
