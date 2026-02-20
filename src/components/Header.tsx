import React from 'react';
import { Menu, Search, Star, Sun, Moon, X, Newspaper } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onToggleSidebar?: () => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onToggleSidebar,
  searchTerm,
  onSearch,
  isFavorite,
  onToggleFavorite,
  showSearch = true,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </Button>

        <h2 className="flex items-center gap-2 min-w-0 text-base md:text-xl font-semibold text-foreground">
          <span className="truncate">{title}</span>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className={`rounded-full ${isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-pressed={isFavorite}
            >
              <Star
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </Button>
          )}
        </h2>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        {showSearch && onSearch && (
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search tools (Cmd+K)..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-9 bg-muted border-transparent focus-visible:ring-primary/20"
              aria-label="Search tools"
            />
            {searchTerm && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors z-10"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <NavLink
          to="/blog"
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium border transition-colors h-8',
              isActive
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted',
            )
          }
          aria-label="Open blog updates"
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Blog</span>
        </NavLink>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground rounded-full h-8 w-8"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-muted-foreground rounded-full h-8 w-8"
        >
          <a
            href="https://github.com/M4R14/dev-util-tools"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
            </svg>
          </a>
        </Button>
      </div>
    </header>
  );
};

export default Header;
