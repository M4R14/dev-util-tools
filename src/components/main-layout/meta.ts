import { TOOLS } from '../../data/tools';
import type { ToolID, ToolMetadata } from '../../types';

export interface MainLayoutPageMeta {
  normalizedPathname: string;
  activeTool: ToolMetadata | undefined;
  isBlogPage: boolean;
  isSettingsPage: boolean;
  isAIBridgePage: boolean;
  pageTitle: string;
  pageDescription: string;
}

export const resolveMainLayoutPageMeta = (pathname: string): MainLayoutPageMeta => {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const activeToolId = normalizedPathname.split('/')[1] as ToolID;
  const activeTool = TOOLS.find((tool) => tool.id === activeToolId);
  const isBlogPage = normalizedPathname === '/blog';
  const isSettingsPage = normalizedPathname === '/settings';
  const isAIBridgePage = normalizedPathname.startsWith('/ai-bridge');

  const pageTitle =
    activeTool?.name ||
    (isBlogPage ? 'Blog' : isSettingsPage ? 'Settings' : isAIBridgePage ? 'AI Bridge' : 'Dashboard');

  const pageDescription =
    activeTool?.description ||
    (isBlogPage
      ? 'Product updates, release notes, and workflow tips.'
      : isSettingsPage
        ? 'Manage app-level preferences, offline cache, and update checks.'
      : isAIBridgePage
        ? 'Machine-friendly tool execution and schema reference.'
        : 'Explore tools, favorites, and recently used workflows.');

  return {
    normalizedPathname,
    activeTool,
    isBlogPage,
    isSettingsPage,
    isAIBridgePage,
    pageTitle,
    pageDescription,
  };
};

export const getMainLayoutDocumentTitle = ({
  activeTool,
  isBlogPage,
  isSettingsPage,
  isAIBridgePage,
}: Pick<
  MainLayoutPageMeta,
  'activeTool' | 'isBlogPage' | 'isSettingsPage' | 'isAIBridgePage'
>) => {
  if (activeTool) return `${activeTool.name} - DevPulse`;
  if (isBlogPage) return 'Blog - DevPulse';
  if (isSettingsPage) return 'Settings - DevPulse';
  if (isAIBridgePage) return 'AI Bridge - DevPulse';
  return 'DevPulse - Developer Utilities';
};
