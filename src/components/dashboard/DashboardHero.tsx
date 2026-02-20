import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, Sparkles, X } from 'lucide-react';

export interface DashboardHeroStat {
  label: string;
  value: number;
  icon: LucideIcon;
}

interface DashboardHeroProps {
  searchTerm: string;
  tip: string;
  stats: DashboardHeroStat[];
  onSearch: (value: string) => void;
  onClearSearch: () => void;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({
  searchTerm,
  tip,
  stats,
  onSearch,
  onClearSearch,
}) => {
  return (
    <div className="mb-10">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 mb-3 tracking-tight">
          DevPulse
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-6 max-w-2xl mx-auto">
          Your essential developer utility suite, supercharged with AI.
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="relative bg-card/90 backdrop-blur rounded-2xl shadow-lg flex items-center p-2 border border-border focus-within:ring-2 focus-within:ring-ring transition-all">
          <Search className="w-5 h-5 text-muted-foreground ml-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search tools (e.g., json, base64, ai)..."
            className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground text-base px-3 h-11"
            autoFocus
            aria-label="Search developer tools"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="p-1.5 mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="hidden sm:flex px-3 py-1 bg-muted rounded-lg text-xs font-medium text-muted-foreground border border-border whitespace-nowrap">
            Cmd + K
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='w-full flex justify-center'>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>Tip: {tip}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
