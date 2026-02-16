import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Sparkles, Star, Clock, ArrowRight, LayoutDashboard } from 'lucide-react';
import { ToolID, ToolMetadata } from '../types';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useToolSearch } from '../hooks/useToolSearch';
import { TOOLS } from '../data/tools';

const TIPS = [
  "Use Cmd+K to quickly open the command palette.",
  "Star your most used tools for quick access.",
  "Check out the AI Assistant for code help.",
  "Base64 decode works on large text inputs too.",
  "The timezone converter helps schedule meetings globally.",
];

const Dashboard: React.FC = () => {
  const { 
    favorites, 
    recents, 
    toggleFavorite, 
    searchTerm, 
    setSearchTerm 
  } = useUserPreferences();

  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  
  const tools = TOOLS;
  const filteredTools = useToolSearch(searchTerm);

  const favoriteTools = tools.filter(t => favorites.includes(t.id));
  
  const recentTools = recents
    .map(id => tools.find(t => t.id === id))
    .filter((t): t is ToolMetadata => !!t && !favorites.includes(t.id))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Hero / Search Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-4 tracking-tight">
          DevPulse
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Your essential developer utility suite, supercharged with AI.
        </p>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-card rounded-2xl shadow-xl flex items-center p-2 border border-border focus-within:ring-2 focus-within:ring-ring transition-all">
            <Search className="w-6 h-6 text-muted-foreground ml-3" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tools (e.g., json, base64, ai)..."
              className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder-muted-foreground text-lg px-4 h-12"
              autoFocus
            />
            <div className="hidden sm:flex px-3 py-1 bg-muted rounded-lg text-xs font-medium text-muted-foreground border border-border">
              Cmd + K
            </div>
          </div>
        </div>

        {/* Dynamic Tip */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
           <Sparkles className="w-4 h-4" />
           <span>Tip: {tip}</span>
        </div>
      </div>

      {searchTerm ? (
        /* Search Results View */
        <div className="space-y-6">
           <h2 className="text-xl font-semibold text-foreground">Search Results ({filteredTools.length})</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredTools.map(tool => (
               <ToolCard key={tool.id} tool={tool} isFavorite={favorites.includes(tool.id)} onToggleFavorite={toggleFavorite} />
             ))}
           </div>
           {filteredTools.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
               No tools found. Try a different search term.
             </div>
           )}
        </div>
      ) : (
        /* Dashboard View */
        <div className="space-y-12">
          
          {/* Favorites Section */}
          {favoriteTools.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-xl font-semibold text-foreground">Favorites</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} isFavorite={true} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          )}

          {/* Quick Access / Recents */}
          {recentTools.length > 0 && (
             <section>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Recently Used</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} isFavorite={favorites.includes(tool.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            </section>
          )}

          {/* All Tools */}
          <section>
             <div className="flex items-center gap-2 mb-6">
                <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">All Tools</h2>
              </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} isFavorite={favorites.includes(tool.id)} onToggleFavorite={toggleFavorite} />
                ))}
             </div>
          </section>

        </div>
      )}

    </div>
  );
};

interface ToolCardProps {
  tool: ToolMetadata;
  isFavorite: boolean;
  onToggleFavorite: (id: ToolID) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isFavorite, onToggleFavorite }) => {
  return (
    <div className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(tool.id);
          }}
          className={`p-1.5 rounded-full hover:bg-muted transition-colors ${isFavorite ? 'text-amber-400' : 'text-muted-foreground'}`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <NavLink to={`/${tool.id}`} className="flex-1 p-6 flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
           {React.isValidElement(tool.icon) ? React.cloneElement(tool.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" }) : tool.icon}
        </div>
        
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {tool.description}
        </p>

        <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
           Open Tool <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </NavLink>
    </div>
  );
};

export default Dashboard;
