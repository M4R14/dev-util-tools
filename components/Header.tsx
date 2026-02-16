
import React from 'react';
import { Menu, Search, Bell, User, Star, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  showSearch = true
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 hidden md:flex items-center gap-3">
          {title}
          {onToggleFavorite && (
            <button 
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isFavorite ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </h2>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        {showSearch && onSearch && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search tools (Cmd+K)..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <a 
          href="https://github.com/StartYourProject/DevPulse" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
           <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
        </a>
      </div>
    </header>
  );
};

export default Header;

