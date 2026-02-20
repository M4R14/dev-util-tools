import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ToolID, ToolMetadata } from '../../types';
import ToolCard from './ToolCard';

interface DashboardToolSectionProps {
  title: string;
  icon: LucideIcon;
  tools: ToolMetadata[];
  favorites: ToolID[];
  onToggleFavorite: (id: ToolID) => void;
  description?: string;
  emptyMessage?: string;
  showWhenEmpty?: boolean;
  headingLevel?: 'h2' | 'h3';
  iconClassName?: string;
  headingClassName?: string;
  className?: string;
}

const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4';

const DashboardToolSection: React.FC<DashboardToolSectionProps> = ({
  title,
  icon: Icon,
  tools,
  favorites,
  onToggleFavorite,
  description,
  emptyMessage = 'No tools available in this section.',
  showWhenEmpty = false,
  headingLevel = 'h2',
  iconClassName = 'w-5 h-5 text-muted-foreground',
  headingClassName = 'text-xl font-semibold text-foreground',
  className,
}) => {
  if (!showWhenEmpty && tools.length === 0) return null;

  const HeadingTag = headingLevel;

  return (
    <section className={className} aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Icon className={iconClassName} />
          <HeadingTag className={headingClassName}>{title}</HeadingTag>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {tools.length}
          </span>
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {tools.length > 0 ? (
        <div className={GRID_CLASS}>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
};

export default DashboardToolSection;
