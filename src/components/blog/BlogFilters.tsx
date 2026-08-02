import React from 'react';
import { Languages, Search } from 'lucide-react';
import { BLOG_CATEGORY_META, BLOG_CATEGORY_ORDER } from '../../data/blogCategories';
import type { BlogCategoryFilter } from '../../hooks/useBlogFilters';
import { BLOG_LANGUAGES, type BlogLanguage } from '../../lib/content/blogContent';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface BlogFiltersProps {
  category: BlogCategoryFilter;
  onCategoryChange: (category: BlogCategoryFilter) => void;
  language: BlogLanguage;
  onLanguageChange: (language: BlogLanguage) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts: Record<BlogCategoryFilter, number>;
}

const LANGUAGE_LABELS: Record<BlogLanguage, string> = { th: 'ไทย', en: 'English' };

const chipClass = (active: boolean, activeClassName?: string) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
    active
      ? (activeClassName ?? 'border-primary/20 bg-primary/10 text-primary')
      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-border/80',
  );

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  category,
  onCategoryChange,
  language,
  onLanguageChange,
  search,
  onSearchChange,
  counts,
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
      <button
        type="button"
        onClick={() => onCategoryChange('all')}
        aria-pressed={category === 'all'}
        className={chipClass(category === 'all')}
      >
        All
        <span className="opacity-60">{counts.all}</span>
      </button>

      {BLOG_CATEGORY_ORDER.map((key) => {
        const meta = BLOG_CATEGORY_META[key];
        const Icon = meta.icon;
        const active = category === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onCategoryChange(active ? 'all' : key)}
            aria-pressed={active}
            className={chipClass(active, meta.className)}
          >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
            <span className="opacity-60">{counts[key]}</span>
          </button>
        );
      })}
    </div>

    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center rounded-full border border-border bg-background/60 p-0.5"
        role="group"
        aria-label="Reading language"
      >
        <Languages className="w-3.5 h-3.5 mx-1.5 text-muted-foreground" aria-hidden="true" />
        {BLOG_LANGUAGES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onLanguageChange(code)}
            aria-pressed={language === code}
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
              language === code
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {LANGUAGE_LABELS[code]}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search updates"
          aria-label="Search updates"
          className="h-8 w-full pl-8 sm:w-52"
        />
      </div>
    </div>
  </div>
);
