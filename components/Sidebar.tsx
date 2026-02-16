import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ToolID, ToolMetadata } from '../types';
import { Sparkles, LayoutDashboard, Search, Star, Clock } from 'lucide-react';
import { Input } from './ui/Input';
import { Card, CardContent, CardTitle, CardDescription } from './ui/Card';
import { cn } from '../lib/utils';

interface SidebarProps {
  tools: ToolMetadata[];
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  favorites: ToolID[];
  recents: ToolID[];
}

// Helper component to handle scrolling ref
const ToolLinkItem: React.FC<{
  tool: ToolMetadata;
  indexOffset: number;
  selectedIndex: number;
  onClose: () => void;
  searchTerm: string;
  favorites: ToolID[];
}> = ({ tool, indexOffset, selectedIndex, onClose, searchTerm, favorites }) => {
  const location = useLocation();
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
      className={({ isActive }) => cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group border border-transparent text-sm",
        isActive 
            ? "bg-primary/10 text-primary border-primary/20 font-medium" 
            : isSelected 
                ? "bg-accent text-accent-foreground border-border" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {({ isActive }) => (
      <>
      <span className={cn("p-1 rounded-md transition-colors flex items-center justify-center",
        isActive 
          ? "bg-primary/20 text-primary shadow-sm" 
          : isSelected 
            ? "bg-muted text-muted-foreground"
            : "bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
      )}>
        {React.cloneElement(tool.icon as React.ReactElement, { size: 16, className: "w-4 h-4" })}
      </span>
      <div className="text-left flex-1 min-w-0">
          <div className="truncate flex items-center gap-1.5">
            {tool.name}
            {favorites.includes(tool.id) && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
          </div>
          {searchTerm && <div className="text-[10px] text-muted-foreground truncate">{tool.description}</div>}
      </div>
      {(isActive || isSelected) && (
          <div className={cn("w-1 h-1 rounded-full ml-auto", isActive ? "bg-primary" : "bg-muted-foreground/30")}></div>
      )}
      </>
      )}
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  tools, 
  isOpen, 
  onClose, 
  searchTerm, 
  onSearch,
  favorites,
  recents
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const visibleTools = useMemo(() => {
    if (searchTerm) {
      return tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const favs = tools.filter(t => favorites.includes(t.id));
    const recs = recents
      .map(id => tools.find(t => t.id === id))
      .filter((t): t is ToolMetadata => !!t && !favorites.includes(t.id))
      .slice(0, 5); // Limit to 5 recent tools
    
    // We duplicate tools in the display (Favorites, Recents, All Tools),
    // but for navigation index keying, we probably want to navigate through them as they appear.
    // However, the current render implementation repeats 'tools' at the bottom.
    // If we want to support up/down navigation, we need a flat list that matches the rendered order.
    
    // NOTE: The original render maps: [Favorites] then [Recents] then [All Tools].
    // This creates duplicates in the visual list (e.g. a tool can be in Favorites AND in All Tools).
    // The user likely wants to navigate visually.
    
    return [
      ...favs.map(t => ({ ...t, _virtualId: `fav-${t.id}` })),
      ...recs.map(t => ({ ...t, _virtualId: `rec-${t.id}` })),
      ...tools.map(t => ({ ...t, _virtualId: `all-${t.id}` }))
    ];
  }, [tools, searchTerm, favorites, recents]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture if sidebar is open (on mobile) or always on desktop
      // and if we aren't focused on an input element (except our search box)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const isSearchInput = e.target instanceof HTMLInputElement && e.target.type === 'text' && e.target.placeholder.includes('Search');
      
      if (isInput && !isSearchInput) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % visibleTools.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + visibleTools.length) % visibleTools.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const tool = visibleTools[selectedIndex];
        if (tool) {
          navigate(`/${tool.id}`);
          if (window.innerWidth < 768) onClose();
          // Reset selection after navigation if desired, or keep it.
          // setSelectedIndex(-1); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleTools, selectedIndex, navigate, onClose]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteTools = tools.filter(t => favorites.includes(t.id));
  const recentTools = recents
    .map(id => tools.find(t => t.id === id))
    .filter((t): t is ToolMetadata => !!t && !favorites.includes(t.id))
    .slice(0, 3); // Limit to 5 recent tools

  const renderToolLink = (tool: ToolMetadata, contextPrefix: string, indexOffset: number) => {
    return <ToolLinkItem 
      key={`${contextPrefix}-${tool.id}`} 
      tool={tool} 
      indexOffset={indexOffset} 
      selectedIndex={selectedIndex} 
      onClose={onClose} 
      searchTerm={searchTerm} 
      favorites={favorites} 
    />;
  };

  const linkRef = React.useRef<HTMLAnchorElement>(null);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 w-64 bg-background border-r border-border z-50 transition-all duration-300 transform flex flex-col shadow-2xl md:shadow-none",
          isOpen ? 'translate-x-0' : '-translate-x-full',
          "md:translate-x-0"
        )}
      >
        {/* Brand */}
        <NavLink
          ref={linkRef}
          to={`/`}
        >
          <div className="h-14 px-4 border-b border-border flex items-center gap-2.5">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">DevPulse</h1>
              <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">Developer Utility</p>
            </div>
          </div>
        </NavLink>
       

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="h-9 pl-8 text-sm bg-muted/40 border-transparent focus:bg-background focus:border-input shadow-none transition-all placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-muted-foreground/20 scrollbar-thumb-transparent transition-colors">
          
            {searchTerm ? (
             <>
               <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                  Results
               </div>
               {filteredTools.length > 0 ? (
                  filteredTools.map((tool, i) => renderToolLink(tool, 'search', i))
               ) : (
                  <div className="px-3 py-8 text-center text-muted-foreground text-xs">
                    No tools found
                  </div>
               )}
             </>
          ) : (
            <>
              {favoriteTools.length > 0 && (
                <div className="mb-3">
                   <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                     Favorites
                   </div>
                   <div className="space-y-0.5">
                     {favoriteTools.map((tool, i) => renderToolLink(tool, 'fav', i))}
                   </div>
                </div>
              )}

              {recentTools.length > 0 && (
                <div className="mb-3">
                   <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                     Recent
                   </div>
                   <div className="space-y-0.5">
                     {recentTools.map((tool, i) => renderToolLink(tool, 'rec', i + favoriteTools.length))}
                   </div>
                </div>
              )}

              <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                Apps
              </div>
              <div className="space-y-0.5">
                {tools.map((tool, i) => renderToolLink(tool, 'all', i + favoriteTools.length + recentTools.length))}
              </div>
            </>
          )} 
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border bg-muted/5">
          <div className="px-2 py-2 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-default group">
             <div className="bg-primary/10 p-1 rounded-md text-primary group-hover:bg-primary/20 transition-colors">
               <Sparkles className="w-3.5 h-3.5" /> 
             </div>
             <span className="font-medium">Gemini Powered</span>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto animate-pulse"></div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
