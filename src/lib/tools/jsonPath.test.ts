import { describe, expect, it } from 'vitest';
import { formatJsonPathMatches, queryJsonPath, queryJsonText } from './jsonPath';

const doc = {
  data: {
    items: [
      { id: 1, name: 'a', tags: ['x'] },
      { id: 2, name: 'b', tags: ['y', 'z'] },
      { id: 3, name: 'c', tags: [] },
    ],
    total: 3,
  },
  'content-type': 'application/json',
  nullable: null,
};

const values = (path: string) => queryJsonPath(doc, path).map((m) => m.value);

describe('queryJsonPath', () => {
  it('reads a nested property', () => {
    expect(values('$.data.total')).toEqual([3]);
  });

  it('treats a leading $ as optional', () => {
    expect(values('data.total')).toEqual([3]);
  });

  it('indexes into an array', () => {
    expect(values('$.data.items[1].name')).toEqual(['b']);
  });

  it('counts a negative index from the end', () => {
    expect(values('$.data.items[-1].name')).toEqual(['c']);
  });

  it('collects every element with a wildcard', () => {
    expect(values('$.data.items[*].id')).toEqual([1, 2, 3]);
  });

  it('accepts the dot form of a wildcard too', () => {
    expect(values('$.data.items.*.id')).toEqual([1, 2, 3]);
  });

  it('flattens a wildcard over nested arrays', () => {
    expect(values('$.data.items[*].tags[*]')).toEqual(['x', 'y', 'z']);
  });

  it('reports the resolved path for each match', () => {
    expect(queryJsonPath(doc, '$.data.items[*].id').map((m) => m.path)).toEqual([
      '$.data.items[0].id',
      '$.data.items[1].id',
      '$.data.items[2].id',
    ]);
  });

  it('reads a key that is not an identifier via quoted brackets', () => {
    expect(values(`$["content-type"]`)).toEqual(['application/json']);
    expect(values(`$['content-type']`)).toEqual(['application/json']);
  });

  it('distinguishes a null value from a missing key', () => {
    expect(values('$.nullable')).toEqual([null]);
    expect(values('$.missing')).toEqual([]);
  });

  it('returns nothing for an out-of-range index rather than throwing', () => {
    expect(values('$.data.items[99]')).toEqual([]);
  });

  it('returns nothing when a path runs through a non-object', () => {
    expect(values('$.data.total.nope')).toEqual([]);
  });

  it('returns the whole document for a bare $', () => {
    expect(queryJsonPath(doc, '$')).toEqual([{ path: '$', value: doc }]);
  });

  it('rejects an empty path', () => {
    expect(() => queryJsonPath(doc, '   ')).toThrow(/Enter a path/);
  });

  it('rejects syntax it does not implement, rather than guessing', () => {
    expect(() => queryJsonPath(doc, '$..id')).toThrow(/Recursive descent/);
    expect(() => queryJsonPath(doc, '$.data[?(@.id>1)]')).toThrow(/Cannot read/);
    expect(() => queryJsonPath(doc, '$.data[0')).toThrow(/Unclosed/);
  });
});

describe('queryJsonText', () => {
  it('parses then queries', () => {
    expect(queryJsonText('{"a":{"b":1}}', '$.a.b').map((m) => m.value)).toEqual([1]);
  });

  it('names the problem when the document is not JSON', () => {
    expect(() => queryJsonText('{oops', '$.a')).toThrow(/Not valid JSON/);
  });
});

describe('formatJsonPathMatches', () => {
  it('returns a bare value for a single match', () => {
    expect(formatJsonPathMatches(queryJsonPath(doc, '$.data.total'))).toBe('3');
  });

  it('returns an array for multiple matches', () => {
    expect(formatJsonPathMatches(queryJsonPath(doc, '$.data.items[*].id'))).toBe(
      '[\n  1,\n  2,\n  3\n]',
    );
  });

  it('returns empty for no matches', () => {
    expect(formatJsonPathMatches([])).toBe('');
  });
});
