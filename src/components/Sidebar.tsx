import React, { useEffect, useMemo } from 'react';
import {
  Clock3,
  Command,
  ExternalLink,
  LayoutDashboard,
  PanelLeftClose,
  Search,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSidebarNavigation } from './sidebar/useSidebarNavigation';
import SidebarBrand from './sidebar/SidebarBrand';
import SidebarSearch from './sidebar/SidebarSearch';
import SidebarNavigation from './sidebar/SidebarNavigation';
import SidebarFooter from './sidebar/SidebarFooter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SummaryTone = 'primary' | 'amber' | 'indigo' | 'slate';

interface SummaryItem {
  label: string;
  count: number;
  icon: LucideIcon;
  tone: SummaryTone;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    searchTerm,
    setSearchTerm,
    filteredTools,
    favoriteTools,
    recentTools,
    selectedIndex,
    favorites,
    internalTools,
    externalTools,
  } = useSidebarNavigation(onClose);

  const hasSearchTerm = searchTerm.trim().length > 0;
  const filteredExternalCount = useMemo(() => {
    const externalToolIds = new Set(externalTools.map((tool) => tool.id));
    return filteredTools.filter((tool) => externalToolIds.has(tool.id)).length;
  }, [filteredTools, externalTools]);
  const filteredInternalCount = filteredTools.length - filteredExternalCount;

  const summaryItems = useMemo<SummaryItem[]>(() => {
    if (hasSearchTerm) {
      return [
        { label: 'Results', count: filteredTools.length, icon: Search, tone: 'primary' },
        { label: 'Apps', count: filteredInternalCount, icon: LayoutDashboard, tone: 'indigo' },
        { label: 'External', count: filteredExternalCount, icon: ExternalLink, tone: 'amber' },
        { label: 'Favorites', count: favoriteTools.length, icon: Star, tone: 'slate' },
      ];
    }

    return [
      { label: 'Favorites', count: favoriteTools.length, icon: Star, tone: 'amber' },
      { label: 'Recent', count: recentTools.length, icon: Clock3, tone: 'slate' },
      { label: 'Apps', count: internalTools.length, icon: LayoutDashboard, tone: 'indigo' },
      { label: 'External', count: externalTools.length, icon: ExternalLink, tone: 'primary' },
    ];
  }, [
    hasSearchTerm,
    filteredTools.length,
    filteredInternalCount,
    filteredExternalCount,
    favoriteTools.length,
    recentTools.length,
    internalTools.length,
    externalTools.length,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/65 z-40 md:hidden backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 w-[17.5rem] bg-background/95 border-r border-border z-50 transition-all duration-300 transform flex flex-col shadow-2xl md:shadow-none backdrop-blur supports-[backdrop-filter]:bg-background/90',
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:opacity-100',
          'md:translate-x-0',
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative">
          <SidebarBrand />
          <button
            type="button"
            className="md:hidden absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <SidebarSearch searchTerm={searchTerm} onSearch={setSearchTerm} />

        <div className="px-3 pb-1 space-y-1.5">
          <div className="grid grid-cols-4 gap-1">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              const toneClass = cn(
                item.tone === 'primary' && 'text-primary border-primary/20 bg-primary/5',
                item.tone === 'amber' && 'text-amber-600 border-amber-500/20 bg-amber-500/5',
                item.tone === 'indigo' && 'text-indigo-600 border-indigo-500/20 bg-indigo-500/5',
                item.tone === 'slate' && 'text-slate-500 border-slate-500/20 bg-slate-500/5',
              );

              return (
                <span
                  key={item.label}
                  title={`${item.label}: ${item.count}`}
                  className={cn(
                    'inline-flex items-center justify-center gap-1 rounded-md border px-1 py-1 text-[10px] leading-none min-w-0',
                    toneClass,
                  )}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span className="font-semibold text-foreground">{item.count}</span>
                </span>
              );
            })}
          </div>

          {!hasSearchTerm && (
            <p className="px-1 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
              <Command className="w-3 h-3" />
              Press Cmd/Ctrl + K for command palette
            </p>
          )}
        </div>

        <SidebarNavigation
          searchTerm={searchTerm}
          filteredTools={filteredTools}
          favoriteTools={favoriteTools}
          recentTools={recentTools}
          internalTools={internalTools}
          externalTools={externalTools}
          selectedIndex={selectedIndex}
          favorites={favorites}
          onClose={onClose}
        />
        <SidebarFooter />
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
