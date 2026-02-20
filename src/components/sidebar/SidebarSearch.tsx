import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';

interface SidebarSearchProps {
  searchTerm: string;
  onSearch: (value: string) => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({ searchTerm, onSearch }) => (
  <div className="px-3 py-3">
    <div className="relative group">
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors"
        aria-hidden="true"
      />
      <Input
        type="text"
        data-sidebar-search-input="true"
        placeholder="Search tools..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="h-9 pl-8 pr-8 text-sm bg-muted/40 border-transparent focus:bg-background focus:border-input shadow-none transition-all placeholder:text-muted-foreground/70"
        aria-label="Search tools"
      />
      {searchTerm && (
        <button
          onClick={() => onSearch('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

export default React.memo(SidebarSearch);
