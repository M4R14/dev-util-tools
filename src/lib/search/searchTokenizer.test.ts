import { describe, expect, it } from 'vitest';
import { tokenizeText } from './searchTokenizer';

describe('tokenizeText', () => {
  it('splits Thai text that has no spaces between words', () => {
    // The default MiniSearch tokeniser returns this whole phrase as one token, which is why
    // searching for a term in the middle of it used to find nothing.
    const tokens = tokenizeText('การเซ็นและตรวจลายเซ็น');

    expect(tokens.length).toBeGreaterThan(1);
    expect(tokens).toContain('ตรวจ');
  });

  it('produces overlapping tokens for a Thai query and the text containing it', () => {
    const documentTokens = new Set(tokenizeText('การเซ็นและตรวจลายเซ็นต้องใช้ crypto.subtle'));
    const queryTokens = tokenizeText('ลายเซ็น');

    expect(queryTokens.length).toBeGreaterThan(0);
    // combineWith: 'AND' means every query token has to be present.
    for (const token of queryTokens) {
      expect(documentTokens.has(token), token).toBe(true);
    }
  });

  it('splits English on whitespace and punctuation', () => {
    expect(tokenizeText('is secure-context only')).toEqual(['is', 'secure', 'context', 'only']);
  });

  it('keeps a dotted identifier whole and also indexes its parts', () => {
    // Intl.Segmenter treats `crypto.subtle` as one word (the example.com rule), so searching
    // `subtle` would otherwise miss it.
    const tokens = tokenizeText('crypto.subtle');

    expect(tokens).toContain('crypto.subtle');
    expect(tokens).toContain('subtle');
  });

  it('leaves a single-part token unexpanded', () => {
    expect(tokenizeText('subtle')).toEqual(['subtle']);
  });

  it('drops punctuation and whitespace', () => {
    expect(tokenizeText('  hello,   world!  ')).toEqual(['hello', 'world']);
  });

  it('returns an empty array for empty input', () => {
    expect(tokenizeText('')).toEqual([]);
  });
});
