import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ToolID, ToolMetadata } from '../types';
import { cn } from '../lib/utils';

interface ToolLinkItemProps {
  tool: ToolMetadata;
  indexOffset: number;
  selectedIndex: number;
  onClose: () => void;
  searchTerm: string;
  isFavorite: boolean;
  onToggleFavorite: (id: ToolID) => void;
}

const ToolLinkItem: React.FC<ToolLinkItemProps> = ({
  tool,
  indexOffset,
  selectedIndex,
  onClose,
  searchTerm,
  isFavorite,
  onToggleFavorite,
}) => {
  const isSelected = selectedIndex === indexOffset;
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const isActive = location.pathname === `/${tool.id}`;

  useEffect(() => {
    if (isSelected && linkRef.current) {
      linkRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <div className="relative group">
      <NavLink
        ref={linkRef}
        to={`/${tool.id}`}
        onClick={() => {
          if (window.innerWidth < 768) onClose();
        }}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 pr-8 rounded-md transition-all duration-200 border border-transparent text-sm',
          isActive
            ? 'bg-primary/10 text-primary border-primary/20 font-medium'
            : isSelected
              ? 'bg-accent text-accent-foreground border-border'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        )}
      >
        <>
          <span
            className={cn(
              'p-1 rounded-md transition-colors flex items-center justify-center',
              isActive
                ? 'bg-primary/20 text-primary shadow-sm'
                : isSelected
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted',
            )}
          >
            <tool.icon className="w-4 h-4" />
          </span>
          <div className="text-left flex-1 min-w-0">
            <div className="truncate">{tool.name}</div>
            {searchTerm && (
              <div className="text-[10px] text-muted-foreground truncate">{tool.description}</div>
            )}
          </div>
          {(isActive || isSelected) && (
            <div
              className={cn(
                'w-1 h-1 rounded-full ml-auto',
                isActive ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            />
          )}
        </>
      </NavLink>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite(tool.id);
        }}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-amber-500 hover:bg-muted transition-all',
          isFavorite
            ? 'opacity-100 text-amber-500'
            : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        )}
        aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        aria-pressed={isFavorite}
      >
        <Star className={cn('w-3.5 h-3.5', isFavorite && 'fill-current')} />
      </button>
    </div>
  );
};

export default ToolLinkItem;
