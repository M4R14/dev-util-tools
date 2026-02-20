import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { ToolID, ToolMetadata } from '../../types';
import FavoriteIcon from '../ui/FavoriteIcon';

interface ToolCardProps {
  tool: ToolMetadata;
  isFavorite: boolean;
  onToggleFavorite: (id: ToolID) => void;
}

const EXTERNAL_TOOL_TAG = 'external tool';

const ToolCard: React.FC<ToolCardProps> = React.memo(({ tool, isFavorite, onToggleFavorite }) => {
  const tags = tool.tags ?? [];
  const isExternal = tags.includes(EXTERNAL_TOOL_TAG);
  const visibleTags = tags.filter((tag) => tag !== EXTERNAL_TOOL_TAG).slice(0, isExternal ? 1 : 2);

  return (
    <div className="group relative h-full">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(tool.id);
          }}
          className={`p-1 rounded-full bg-background/80 border border-border hover:bg-muted transition-colors ${isFavorite ? 'text-amber-500' : 'text-muted-foreground'}`}
          aria-label={
            isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`
          }
          aria-pressed={isFavorite}
        >
           <FavoriteIcon className={`w-3.5 h-3.5`} isFavorite={isFavorite} />
        </button>
      </div>

      <NavLink
        to={`/${tool.id}`}
        className="h-full flex flex-col rounded-xl border border-border bg-card p-4 pr-11 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200"
        aria-label={`Open ${tool.name}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <tool.icon className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {tool.name}
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {isExternal && (
              <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                External
              </span>
            )}
            {visibleTags.map((tag) => (
              <span
                key={`${tool.id}-${tag}`}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="inline-flex items-center text-[11px] font-medium text-primary shrink-0">
            Open <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </div>
      </NavLink>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

export default ToolCard;
