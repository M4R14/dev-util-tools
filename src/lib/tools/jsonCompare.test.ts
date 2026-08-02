import { describe, expect, it } from 'vitest';
import {
  compareJsonText,
  compareJsonValues,
  jsonTypeOf,
  summarizeJsonDifferences,
} from './jsonCompare';

describe('compareJsonValues', () => {
  it('ignores key order', () => {
    // The reason this tool exists: the text diff reports this pair as 100% changed.
    const result = compareJsonValues(
      { id: 1, name: 'a', tags: ['x', 'y'] },
      { name: 'a', tags: ['x', 'y'], id: 1 },
    );

    expect(result.identical).toBe(true);
    expect(result.differences).toEqual([]);
  });

  it('names the one field that changed inside a large object', () => {
    const result = compareJsonValues(
      { data: { user: { id: 1, email: 'a@b.com', active: true } } },
      { data: { user: { id: 1, email: 'c@d.com', active: true } } },
    );

    expect(result.differences).toEqual([
      { path: '$.data.user.email', kind: 'changed', left: 'a@b.com', right: 'c@d.com' },
    ]);
  });

  it('reports a string that should have been a number as a type change', () => {
    const result = compareJsonValues({ price: 100 }, { price: '100' });

    expect(result.differences[0]).toMatchObject({
      path: '$.price',
      kind: 'type-changed',
      leftType: 'number',
      rightType: 'string',
    });
  });

  it('distinguishes null from a missing key', () => {
    expect(compareJsonValues({ a: null }, { a: null }).identical).toBe(true);
    expect(compareJsonValues({ a: null }, {}).differences[0]).toMatchObject({
      path: '$.a',
      kind: 'removed',
    });
    expect(
      compareJsonValues({ a: null }, { a: undefined as unknown }).differences[0],
    ).toMatchObject({ kind: 'type-changed' });
  });

  it('indexes array differences by position', () => {
    const result = compareJsonValues(
      { items: [{ price: 100 }, { price: 200 }] },
      { items: [{ price: 100 }, { price: 120 }] },
    );

    expect(result.differences).toEqual([
      { path: '$.items[1].price', kind: 'changed', left: 200, right: 120 },
    ]);
  });

  it('reports extra and missing array entries', () => {
    const result = compareJsonValues([1, 2], [1, 2, 3]);
    expect(result.differences).toEqual([{ path: '$[2]', kind: 'added', right: 3 }]);

    const shorter = compareJsonValues([1, 2, 3], [1, 2]);
    expect(shorter.differences).toEqual([{ path: '$[2]', kind: 'removed', left: 3 }]);
  });

  it('treats a reordered array as different, since order is meaningful in JSON', () => {
    const result = compareJsonValues(['x', 'y'], ['y', 'x']);

    expect(result.identical).toBe(false);
    expect(result.differences).toHaveLength(2);
  });

  it('quotes keys that are not plain identifiers', () => {
    const result = compareJsonValues({ 'content-type': 'a' }, { 'content-type': 'b' });

    expect(result.differences[0].path).toBe('$["content-type"]');
  });

  it('compares primitives at the root', () => {
    expect(compareJsonValues(1, 1).identical).toBe(true);
    expect(compareJsonValues(1, 2).differences[0]).toEqual({
      path: '$',
      kind: 'changed',
      left: 1,
      right: 2,
    });
  });

  it('walks deeply nested structures', () => {
    const result = compareJsonValues(
      { a: { b: { c: [{ d: 1 }] } } },
      { a: { b: { c: [{ d: 2 }] } } },
    );

    expect(result.differences[0].path).toBe('$.a.b.c[0].d');
  });
});

describe('compareJsonText', () => {
  it('ignores whitespace and indentation', () => {
    const result = compareJsonText('{"a":1,"b":2}', '{\n  "b": 2,\n  "a": 1\n}');

    expect(result.identical).toBe(true);
  });

  it('names which side failed to parse', () => {
    expect(() => compareJsonText('{oops', '{}')).toThrow(/Left side/);
    expect(() => compareJsonText('{}', '{oops')).toThrow(/Right side/);
  });
});

describe('jsonTypeOf', () => {
  it.each([
    [null, 'null'],
    [[], 'array'],
    [{}, 'object'],
    ['a', 'string'],
    [1, 'number'],
    [true, 'boolean'],
  ])('%s -> %s', (value, expected) => {
    expect(jsonTypeOf(value)).toBe(expected);
  });
});

describe('summarizeJsonDifferences', () => {
  it('counts each kind', () => {
    const { differences } = compareJsonValues(
      { keep: 1, drop: 2, change: 3, retype: 4 },
      { keep: 1, change: 30, retype: '4', add: 5 },
    );

    expect(summarizeJsonDifferences(differences)).toEqual({
      added: 1,
      removed: 1,
      changed: 1,
      typeChanged: 1,
      total: 4,
    });
  });
});
