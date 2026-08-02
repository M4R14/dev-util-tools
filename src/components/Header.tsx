import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { nextThemePreference } from '../lib/platform/theme';
import { Button } from './ui/Button';
import { FavoriteButton } from './ui/FavoriteButton';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onToggleSidebar?: () => void;
  /** Desktop-only: hides or restores the permanent sidebar column. */
  onToggleSidebarCollapsed?: () => void;
  sidebarCollapsed?: boolean;
  /**
   * True once the page's own heading has scrolled out of the content area.
   *
   * The title and its favourite toggle were previously rendered here at all times, duplicating the
   * page heading sixty pixels below — two identical stars, both labelled only "Add to Favorites".
   * Deferring to the scrolled state keeps the orientation a sticky bar is for and shows each
   * control once.
   */
  showTitle?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onToggleSidebar,
  onToggleSidebarCollapsed,
  sidebarCollapsed = false,
  isFavorite,
  onToggleFavorite,
  showTitle = true,
}) => {
  const { theme, toggleTheme } = useTheme();

  // The button cycles light → dark → system, so its label names the destination, not the state.
  const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon = THEME_ICONS[theme];
  const nextTheme = nextThemePreference(theme);

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

        {onToggleSidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebarCollapsed}
            className="hidden md:inline-flex text-muted-foreground h-8 w-8"
            aria-pressed={sidebarCollapsed}
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        )}

        {showTitle && (
          <h2 className="flex items-center gap-2 min-w-0 text-base md:text-xl font-semibold text-foreground">
            <span className="truncate">{title}</span>
            {onToggleFavorite && (
              <FavoriteButton
                isFavorite={!!isFavorite}
                onToggle={onToggleFavorite}
                itemName={title}
              />
            )}
          </h2>
        )}
      </div>

      {/*
        A second "Search tools" input used to sit here, bound to the same value as the sidebar's
        and visible only at md and up — exactly the widths where the sidebar's own search box is
        already on screen. Below about 1100px it also collapsed to 78px, roughly six characters.
      */}

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

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium border transition-colors h-8',
              isActive
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted',
            )
          }
          aria-label="Open app settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Settings</span>
        </NavLink>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground rounded-full h-8 w-8"
          title={`Theme: ${theme}. Switch to ${nextTheme}.`}
          aria-label={`Theme: ${theme}. Switch to ${nextTheme}.`}
        >
          <ThemeIcon className="w-4 h-4" aria-hidden="true" />
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
