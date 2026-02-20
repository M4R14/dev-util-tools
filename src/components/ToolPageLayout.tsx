import React from 'react';
import { Share2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { ToolMetadata } from '../types';
import { useSearch } from '../context/SearchContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { Button } from './ui/Button';
import FavoriteButton from './ui/FavoriteButton';

interface ToolPageLayoutProps {
  tool: ToolMetadata;
  children: React.ReactNode;
  className?: string;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool, children, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchTerm } = useSearch();
  const { favorites, toggleFavorite } = useUserPreferences();
  const isFavorite = favorites.includes(tool.id);

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    navigate('/');
  };

  const handleShareClick = async () => {
    const shareUrl = typeof window === 'undefined'
      ? `${location.pathname}${location.search}${location.hash}`
      : `${window.location.origin}${location.pathname}${location.search}${location.hash}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Shareable link copied');
    } catch {
      toast.error('Unable to copy shareable link');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 ">
      <div className="pb-5 md:pb-6 border-b border-border/50">
        <div className="flex flex-col gap-0">
          <div className="flex items-start gap-2 md:gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <h1 className="flex min-w-0 items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                <span className="shrink-0 p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <tool.icon className="w-6 h-6" />
                </span>
                <span className="min-w-0 truncate">{tool.name}</span>
              </h1>
            </div>
            <div className="flex items-center my-auto" >
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={() => toggleFavorite(tool.id)}
                className="my-auto h-8 w-8 shrink-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className="mt-1 my-auto h-7 shrink-0 px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                aria-label={`Share ${tool.name}`}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Share
              </Button>
            </div>
            
          </div>

          <p className="text-sm mb-1 md:text-base text-muted-foreground leading-relaxed md:pl-[3.2rem]">
            {tool.description}
          </p>

          {tool.tags && tool.tags.length > 0 && (
            <div className="md:pl-[3.2rem] mb-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-primary border border-border hover:border-primary/30 hover:bg-primary/10 cursor-pointer transition-colors"
                    title={`Filter by ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default React.memo(ToolPageLayout);
