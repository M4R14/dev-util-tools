import { describe, it, expect } from 'vitest';
import { resolvePageMeta } from './pageMeta';
import { TOOLS } from '../data/tools';

describe('resolvePageMeta', () => {
  describe.each([
    {
      route: '/blog',
      pageTitle: 'Blog',
      documentTitle: 'Blog - DevPulse',
    },
    {
      route: '/settings',
      pageTitle: 'Settings',
      documentTitle: 'Settings - DevPulse',
    },
    {
      route: '/ai-bridge',
      pageTitle: 'AI Bridge',
      documentTitle: 'AI Bridge - DevPulse',
    },
    {
      route: '/ai-bridge/catalog',
      pageTitle: 'AI Bridge',
      documentTitle: 'AI Bridge - DevPulse',
    },
    {
      route: '/',
      pageTitle: 'Dashboard',
      documentTitle: 'DevPulse - Developer Utilities',
    },
    {
      route: '/not-a-real-route',
      pageTitle: 'Dashboard',
      documentTitle: 'DevPulse - Developer Utilities',
    },
  ])('$route', ({ route, pageTitle, documentTitle }) => {
    it(`is "${pageTitle}" with a non-empty description and no active tool`, () => {
      const meta = resolvePageMeta(route);

      expect(meta.pageTitle).toBe(pageTitle);
      expect(meta.documentTitle).toBe(documentTitle);
      expect(meta.activeTool).toBeUndefined();
      expect(meta.pageDescription.length).toBeGreaterThan(0);
    });
  });

  it('resolves a tool route to that tool', () => {
    const meta = resolvePageMeta('/json-formatter');

    expect(meta.activeTool?.id).toBe('json-formatter');
    expect(meta.pageTitle).toBe('JSON Formatter');
    expect(meta.documentTitle).toBe('JSON Formatter - DevPulse');
    expect(meta.pageDescription).toBe(meta.activeTool?.description);
  });

  it('resolves every registered tool', () => {
    for (const tool of TOOLS) {
      const meta = resolvePageMeta(`/${tool.id}`);

      expect(meta.activeTool?.id).toBe(tool.id);
      expect(meta.documentTitle).toBe(`${tool.name} - DevPulse`);
    }
  });

  it('strips trailing slashes before matching', () => {
    expect(resolvePageMeta('/blog/').pageTitle).toBe('Blog');
    expect(resolvePageMeta('/json-formatter//').activeTool?.id).toBe('json-formatter');
    expect(resolvePageMeta('/').normalizedPathname).toBe('/');
    expect(resolvePageMeta('///').normalizedPathname).toBe('/');
  });

  it('keeps query-style segments out of the tool lookup', () => {
    // Only the first path segment identifies a tool.
    expect(resolvePageMeta('/json-formatter/extra').activeTool?.id).toBe('json-formatter');
  });

  it('accepts an injected tool list', () => {
    expect(resolvePageMeta('/json-formatter', []).activeTool).toBeUndefined();
    expect(resolvePageMeta('/json-formatter', []).pageTitle).toBe('Dashboard');
  });
});
