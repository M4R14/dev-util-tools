import React, { useMemo, useState } from 'react';
import { Clock, ExternalLink, LayoutDashboard, Star } from 'lucide-react';
import { ToolMetadata } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useSearch } from '../context/SearchContext';
import { useToolSearch } from '../hooks/useToolSearch';
import { TOOLS } from '../data/tools';
import DashboardHero, { type DashboardHeroStat } from './dashboard/DashboardHero';
import DashboardToolSection from './dashboard/DashboardToolSection';

const TIPS = [
  'Use Cmd+K to quickly open the command palette.',
  'Star your most used tools for quick access.',
  'Check out the AI Assistant for code help.',
  'Base64 decode works on large text inputs too.',
  'The timezone converter helps schedule meetings globally.',
];

const EXTERNAL_TOOL_TAG = 'external tool';

const Dashboard: React.FC = () => {
  const { favorites, recents, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const hasSearchTerm = searchTerm.trim().length > 0;

  const filteredTools = useToolSearch(searchTerm);
  const isExternalTool = useMemo(
    () => (tool: ToolMetadata) => tool.tags?.includes(EXTERNAL_TOOL_TAG) ?? false,
    [],
  );

  const internalTools = useMemo(
    () => TOOLS.filter((tool) => !isExternalTool(tool)),
    [isExternalTool],
  );
  const externalTools = useMemo(
    () => TOOLS.filter((tool) => isExternalTool(tool)),
    [isExternalTool],
  );

  const filteredInternalTools = useMemo(
    () => filteredTools.filter((tool) => !isExternalTool(tool)),
    [filteredTools, isExternalTool],
  );
  const filteredExternalTools = useMemo(
    () => filteredTools.filter((tool) => isExternalTool(tool)),
    [filteredTools, isExternalTool],
  );

  const favoriteTools = useMemo(
    () => TOOLS.filter((tool) => favorites.includes(tool.id)),
    [favorites],
  );

  const recentTools = useMemo(
    () =>
      recents
        .map((id) => TOOLS.find((tool) => tool.id === id))
        .filter((tool): tool is ToolMetadata => !!tool && !favorites.includes(tool.id))
        .slice(0, 4),
    [recents, favorites],
  );

  const heroStats = useMemo<DashboardHeroStat[]>(
    () => [
      { label: 'Apps', value: internalTools.length, icon: LayoutDashboard },
      { label: 'Favorites', value: favoriteTools.length, icon: Star },
      { label: 'External Tools', value: externalTools.length, icon: ExternalLink },
    ],
    [internalTools.length, favoriteTools.length, externalTools.length],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <DashboardHero
        searchTerm={searchTerm}
        tip={tip}
        stats={heroStats}
        onSearch={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
      />

      {hasSearchTerm ? (
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card/60 backdrop-blur px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                {filteredTools.length} matches
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Showing matches for <span className="font-medium text-foreground">&quot;{searchTerm}&quot;</span>.
            </p>
          </section>

          <DashboardToolSection
            title="Apps"
            icon={LayoutDashboard}
            tools={filteredInternalTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Built-in tools in this workspace."
            showWhenEmpty
            emptyMessage="No built-in tools matched this search."
            headingLevel="h3"
            iconClassName="w-4 h-4 text-muted-foreground"
            headingClassName="text-base font-semibold text-foreground"
            className="space-y-0"
          />

          <DashboardToolSection
            title="External Tools"
            icon={ExternalLink}
            tools={filteredExternalTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Quick links that open trusted external utilities."
            showWhenEmpty
            emptyMessage="No external tools matched this search."
            headingLevel="h3"
            iconClassName="w-4 h-4 text-muted-foreground"
            headingClassName="text-base font-semibold text-foreground"
            className="space-y-0"
          />
        </div>
      ) : (
        <div className="space-y-12">
          <DashboardToolSection
            title="Favorites"
            icon={Star}
            tools={favoriteTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Pin the tools you use most."
            iconClassName="w-5 h-5 text-amber-500 fill-amber-500"
          />

          <DashboardToolSection
            title="Recently Used"
            icon={Clock}
            tools={recentTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Jump back into your latest workflow."
            iconClassName="w-5 h-5 text-primary"
          />

          <DashboardToolSection
            title="Apps"
            icon={LayoutDashboard}
            tools={internalTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Built-in developer tools available in DevPulse."
          />

          <DashboardToolSection
            title="External Tools"
            icon={ExternalLink}
            tools={externalTools}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            description="Launch external utilities in a new tab."
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
