import type { ComponentType } from 'react';
import type { ToolMetadata } from '../../types';

export type SidebarSectionKey = 'search' | 'favorites' | 'recent' | 'apps' | 'external';

/** Assigned to a repeat listing of a tool already shown higher up — never keyboard-selectable. */
export const NOT_NAVIGABLE = -1;

export interface SidebarSectionItem {
  tool: ToolMetadata;
  /**
   * Position in the keyboard traversal order, or `NOT_NAVIGABLE`.
   *
   * A favourited tool is listed twice on purpose — once under Favorites and again in the complete
   * Apps catalogue — but arrowing down should stop on it once, not twice. Only the first listing
   * gets an index.
   */
  indexOffset: number;
}

export interface SidebarToolSection {
  key: SidebarSectionKey;
  title: string;
  icon: ComponentType<{ className?: string }>;
  tools: ToolMetadata[];
  items: SidebarSectionItem[];
  /** Folded away by the reader. The count stays visible; the rows do not. */
  isCollapsed: boolean;
  contextPrefix: string;
  className?: string;
}
