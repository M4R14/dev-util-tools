import { describe, expect, it } from 'vitest';
import { BLOG_POSTS, BLOG_POST_ISSUES } from './blogPosts';

/**
 * The frontmatter schema drops invalid posts at runtime, which keeps a typo from shipping a
 * half-broken card — but only this test turns that into a gate. Without it, a misspelt `catagory:`
 * would make a post silently vanish from the site instead of silently changing category.
 */
describe('shipped blog content', () => {
  it('has no posts rejected by the frontmatter schema', () => {
    expect(BLOG_POST_ISSUES).toEqual([]);
  });

  it('ships at least one post', () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
  });

  it('gives every post a unique id', () => {
    const ids = BLOG_POSTS.map((post) => post.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sorts newest first', () => {
    const dates = BLOG_POSTS.map((post) => post.date);

    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it('renders summary and body html for every post', () => {
    for (const post of BLOG_POSTS) {
      expect(post.summaryHtml, `${post.id} summary`).not.toBe('');
      expect(post.html.shared || post.html.th || post.html.en, `${post.id} body`).not.toBe('');
    }
  });

  it('escapes raw HTML in rendered post bodies', () => {
    for (const post of BLOG_POSTS) {
      const html = [post.html.shared, post.html.th, post.html.en].join('');

      expect(html, `${post.id}`).not.toContain('<script');
      expect(html, `${post.id}`).not.toContain('javascript:');
    }
  });

  it('marks the generated release notes as language-neutral so no filter can hide it', () => {
    const auto = BLOG_POSTS.find((post) => post.id === 'auto-release-notes');

    expect(auto?.languageNeutral).toBe(true);
  });

  it('splits the hand-written posts into both languages', () => {
    const bilingual = BLOG_POSTS.filter((post) => post.id !== 'auto-release-notes');

    expect(bilingual.length).toBeGreaterThan(0);
    for (const post of bilingual) {
      expect(post.html.th, `${post.id} th`).not.toBe('');
      expect(post.html.en, `${post.id} en`).not.toBe('');
    }
  });
});
