import { describe, expect, it } from 'vitest';
import { parseFamily, serializeFamily } from './storage';
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

  it('round-trips a partner link', () => {
    const couple = [
      member('gp', null, { spouseId: 'gm' }),
      member('gm', null, { spouseId: 'gp' }),
    ];
    const result = parseFamily(serializeFamily(couple));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.members[0].spouseId).toBe('gm');
  });

  it('reads a member with no gender as unknown rather than rejecting the file', () => {
    const result = parseFamily('[{"id":"a","name":"A","relationship":"","note":""}]');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.members[0].gender).toBe('unknown');
  });
});
