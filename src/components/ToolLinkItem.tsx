import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ToolID, ToolMetadata } from '../types';
import { cn } from '../lib/utils';

interface ToolLinkItemProps {
  tool: ToolMetadata;
  indexOffset: number;
  selectedIndex: number;
  onClose: () => void;
  searchTerm: string;
  favorites: ToolID[];
}

const ToolLinkItem: React.FC<ToolLinkItemProps> = ({
  tool,
  indexOffset,
  selectedIndex,
  onClose,
  searchTerm,
  favorites,
}) => {
  const isSelected = selectedIndex === indexOffset;
  const linkRef = React.useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isSelected && linkRef.current) {
      linkRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSelected]);

  return (
    <NavLink
      ref={linkRef}
      to={`/${tool.id}`}
      onClick={() => {
        if (window.innerWidth < 768) onClose();
      }}
      className={({ isActive }) =>
        cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group border border-transparent text-sm',
          isActive
            ? 'bg-primary/10 text-primary border-primary/20 font-medium'
            : isSelected
              ? 'bg-accent text-accent-foreground border-border'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
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
            <div className="truncate flex items-center gap-1.5">
              {tool.name}
              {favorites.includes(tool.id) && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
            </div>
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
            ></div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default ToolLinkItem;
