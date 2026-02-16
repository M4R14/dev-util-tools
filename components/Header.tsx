
import React from 'react';
import { Menu, Search, Bell, User, Star } from 'lucide-react';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onToggleSidebar, 
  searchTerm, 
  onSearch,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors md:hidden text-slate-400"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center bg-slate-800 border border-slate-700 hover:border-slate-600 focus-within:border-blue-500 rounded-lg px-3 py-1.5 w-64 transition-colors">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search tools..." 
            value={searchTerm}
            onChange={(e) => onSearch?.(e.target.value)}
            className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder-slate-500 text-slate-200 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {onToggleFavorite && (
          <button 
            onClick={onToggleFavorite}
            className={`p-2 transition-colors relative group ${isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        )}
        
        <div className="h-8 w-[1px] bg-slate-800 mx-1 hidden md:block"></div>
        
        <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
