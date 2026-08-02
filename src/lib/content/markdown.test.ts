import { describe, expect, it } from 'vitest';
import { isSafeUrl, renderInlineMarkdown, renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('escapes raw HTML instead of emitting it', () => {
    const html = renderMarkdown('text <img src=x onerror=alert(1)>');

    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img');
  });

  it('keeps HTML-looking text visible rather than swallowing it', () => {
    // The real-world symptom: a release note about `<div>` used to lose the word entirely.
    expect(renderMarkdown('support <div> wrappers')).toContain('&lt;div&gt;');
  });

  it('still renders ordinary markdown', () => {
    const html = renderMarkdown('- one\n- two\n\n**bold** and `code`');

    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
  });

  it('renders gfm tables', () => {
    expect(renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |')).toContain('<table>');
  });

  it('keeps safe links but drops dangerous protocols', () => {
    expect(renderMarkdown('[ok](https://example.com)')).toContain('href="https://example.com"');

    const dangerous = renderMarkdown('[x](javascript:alert(1))');
    expect(dangerous).not.toContain('javascript:');
    expect(dangerous).toContain('x');
  });

  it('returns an empty string for blank input', () => {
    expect(renderMarkdown('   ')).toBe('');
  });
});

describe('renderInlineMarkdown', () => {
  it('escapes HTML without adding block wrappers', () => {
    const html = renderInlineMarkdown('sum <b>x</b>');

    expect(html).toContain('&lt;b&gt;');
    expect(html).not.toContain('<p>');
  });

  it('renders inline emphasis and code', () => {
    expect(renderInlineMarkdown('**a** and `b`')).toBe('<strong>a</strong> and <code>b</code>');
  });
});

describe('isSafeUrl', () => {
  it.each([
    ['https://example.com', true],
    ['http://example.com', true],
    ['mailto:a@b.com', true],
    ['/relative/path', true],
    ['#anchor', true],
    ['docs/page.md', true],
    ['javascript:alert(1)', false],
    ['data:text/html;base64,PHNjcmlwdD4=', false],
    ['vbscript:msgbox(1)', false],
    ['', false],
  ])('%s -> %s', (href, expected) => {
    expect(isSafeUrl(href)).toBe(expected);
  });
});
