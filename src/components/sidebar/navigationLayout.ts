import type { ComponentType } from 'react';
import type { ToolMetadata } from '../../types';

export type SidebarSectionKey = 'search' | 'favorites' | 'recent' | 'apps' | 'external';

export interface SidebarSectionItem {
  tool: ToolMetadata;
  indexOffset: number;
}

export interface SidebarToolSection {
  key: SidebarSectionKey;
  title: string;
  icon: ComponentType<{ className?: string }>;
  tools: ToolMetadata[];
  items: SidebarSectionItem[];
  contextPrefix: string;
  className?: string;
}
