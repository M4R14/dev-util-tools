import { describe, expect, it } from 'vitest';
import { isLanguageNeutral, splitLanguageSections } from './blogContent';

describe('splitLanguageSections', () => {
  it('splits a TH/EN post and drops the language headings', () => {
    const sections = splitLanguageSections('## TH\n\nสวัสดี\n\n## EN\n\nHello');

    expect(sections.th).toBe('สวัสดี');
    expect(sections.en).toBe('Hello');
    expect(sections.shared).toBe('');
    expect(sections.th).not.toContain('##');
  });

  it('treats content before the first language heading as shared', () => {
    const sections = splitLanguageSections('Intro line\n\n## TH\n\nไทย\n\n## EN\n\nEnglish');

    expect(sections.shared).toBe('Intro line');
    expect(sections.th).toBe('ไทย');
  });

  it('puts everything in shared when there are no language headings', () => {
    // auto-release-notes.md is generated with no headings at all.
    const sections = splitLanguageSections('- one\n- two');

    expect(sections.shared).toBe('- one\n- two');
    expect(sections.th).toBe('');
    expect(isLanguageNeutral(sections)).toBe(true);
  });

  it('leaves non-language headings inside their section', () => {
    const sections = splitLanguageSections('## TH\n\n### สิ่งที่เปลี่ยน\n\n- ก');

    expect(sections.th).toContain('### สิ่งที่เปลี่ยน');
  });

  it('accepts lowercase and other heading levels', () => {
    const sections = splitLanguageSections('# th\n\na\n\n#### en\n\nb');

    expect(sections.th).toBe('a');
    expect(sections.en).toBe('b');
  });

  it('does not treat a heading that merely starts with TH as a language marker', () => {
    const sections = splitLanguageSections('## Thai Date Converter\n\nbody');

    expect(sections.shared).toContain('## Thai Date Converter');
    expect(sections.th).toBe('');
  });

  it('reports a bilingual post as not language-neutral', () => {
    expect(isLanguageNeutral(splitLanguageSections('## TH\n\na\n\n## EN\n\nb'))).toBe(false);
  });
});
