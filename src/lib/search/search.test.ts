import { describe, expect, it } from 'vitest';
import { createSearchIndex } from './search';

interface Doc {
  id: string;
  title: string;
  body: string;
}

const docs: Doc[] = [
  { id: 'thai-id', title: 'Thai ID Decoder', body: 'บัตรประชาชน checksum validator' },
  { id: 'thai-date', title: 'Thai Date Converter', body: 'buddhist calendar date พ.ศ.' },
  { id: 'json', title: 'JSON Formatter', body: 'format prettify minify validate date' },
];

const index = createSearchIndex(docs, {
  name: 'test-docs',
  getId: (doc) => doc.id,
  fields: { title: (doc) => doc.title, body: (doc) => doc.body },
  boost: { title: 3, body: 1 },
});

const ids = (results: Doc[]) => results.map((doc) => doc.id);

describe('createSearchIndex', () => {
  it('returns every document for an empty term', () => {
    expect(index.search('')).toBe(docs);
    expect(index.search('   ')).toBe(docs);
  });

  it('matches English terms', () => {
    expect(ids(index.search('formatter'))).toContain('json');
  });

  it('matches a Thai term that sits mid-word', () => {
    // The whole point of the shared tokeniser: the default one turns `บัตรประชาชน` into a single
    // token, so this returned nothing in tool search while working in the blog.
    expect(ids(index.search('ประชาชน'))).toContain('thai-id');
  });

  it('matches a Thai term at the start of a word', () => {
    expect(ids(index.search('บัตร'))).toContain('thai-id');
  });

  it('narrows as words are added, rather than widening', () => {
    // Under the previous OR default this went the other way: more words, more results.
    const one = index.search('thai');
    const two = index.search('thai date');

    expect(one.length).toBeGreaterThanOrEqual(two.length);
    expect(ids(two)).toEqual(['thai-date']);
  });

  it('widens with OR when the caller asks for it', () => {
    // Related tools query with a bag of terms, where any overlap is a signal.
    const orIndex = createSearchIndex(docs, {
      name: 'test-docs-or',
      getId: (doc) => doc.id,
      fields: { title: (doc) => doc.title, body: (doc) => doc.body },
      combineWith: 'OR',
    });

    expect(orIndex.search('thai date').length).toBeGreaterThan(index.search('thai date').length);
  });

  it('keeps separate caches for the same array under different names', () => {
    // Keying the cache on the array alone would hand the OR index to the AND caller. TOOLS is
    // indexed twice in this app — once for tool search, once for related tools.
    const strict = createSearchIndex(docs, {
      name: 'collision-and',
      getId: (doc) => doc.id,
      fields: { title: (doc) => doc.title, body: (doc) => doc.body },
      combineWith: 'AND',
    });
    const loose = createSearchIndex(docs, {
      name: 'collision-or',
      getId: (doc) => doc.id,
      fields: { title: (doc) => doc.title, body: (doc) => doc.body },
      combineWith: 'OR',
    });

    expect(strict.search('thai date').length).toBeLessThan(loose.search('thai date').length);
  });

  it('ranks boosted fields first', () => {
    // "date" is in thai-date's title area and in json's body only.
    expect(ids(index.search('date'))[0]).toBe('thai-date');
  });

  it('returns nothing for a term that matches nothing', () => {
    expect(index.search('zzzqqq')).toEqual([]);
  });

  it('drops hits whose document is missing from the caller list', () => {
    const empty = createSearchIndex([] as Doc[], {
      name: 'empty',
      getId: (doc) => doc.id,
      fields: { title: (doc) => doc.title, body: (doc) => doc.body },
    });

    expect(empty.search('anything')).toEqual([]);
  });
});
