import { TOOLS } from '../../data/tools';
import type { ToolID, ToolMetadata } from '../../types';

/**
 * Everything a page's chrome needs, derived from the pathname alone.
 *
 * `documentTitle` is part of the result rather than a second function: the page kind is decided
 * once here, so callers never re-derive it. The `isBlogPage`/`isSettingsPage`/`isAIBridgePage`
 * flags this module used to expose existed only to feed that second function — they were
 * implementation leaking into the interface and are now internal.
 */
export interface PageMeta {
  normalizedPathname: string;
  activeTool: ToolMetadata | undefined;
  pageTitle: string;
  pageDescription: string;
  documentTitle: string;
}

const APP_NAME = 'DevPulse';

interface StaticPage {
  matches: (pathname: string) => boolean;
  title: string;
  description: string;
}

/** Non-tool routes, in match order. Anything unmatched falls through to the dashboard. */
const STATIC_PAGES: StaticPage[] = [
  {
    matches: (pathname) => pathname === '/blog',
    title: 'Blog',
    description: 'Product updates, release notes, and workflow tips.',
  },
  {
    matches: (pathname) => pathname === '/settings',
    title: 'Settings',
    description: 'Manage app-level preferences, offline cache, and update checks.',
  },
  {
    matches: (pathname) => pathname.startsWith('/ai-bridge'),
    title: 'AI Bridge',
    description: 'Machine-friendly tool execution and schema reference.',
  },
];

const DASHBOARD: StaticPage = {
  matches: () => true,
  title: 'Dashboard',
  description: 'Explore tools, favorites, and recently used workflows.',
};

export const resolvePageMeta = (pathname: string, tools: ToolMetadata[] = TOOLS): PageMeta => {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const activeToolId = normalizedPathname.split('/')[1] as ToolID;
  const activeTool = tools.find((tool) => tool.id === activeToolId);

  if (activeTool) {
    return {
      normalizedPathname,
      activeTool,
      pageTitle: activeTool.name,
      pageDescription: activeTool.description,
      documentTitle: `${activeTool.name} - ${APP_NAME}`,
    };
  }

  const page = STATIC_PAGES.find((candidate) => candidate.matches(normalizedPathname)) ?? DASHBOARD;

  return {
    normalizedPathname,
    activeTool: undefined,
    pageTitle: page.title,
    pageDescription: page.description,
    // The dashboard is the app's front door, so it gets the product tagline rather than
    // "Dashboard - DevPulse".
    documentTitle:
      page === DASHBOARD ? `${APP_NAME} - Developer Utilities` : `${page.title} - ${APP_NAME}`,
  };
};
