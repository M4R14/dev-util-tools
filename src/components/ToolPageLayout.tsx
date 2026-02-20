import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ToolMetadata } from '../types';
import { useSearch } from '../context/SearchContext';

interface ToolPageLayoutProps {
  tool: ToolMetadata;
  children: React.ReactNode;
  className?: string;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool, children, className }) => {
  const navigate = useNavigate();
  const { setSearchTerm } = useSearch();

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    navigate('/');
  };

  return (
    <div className="space-y-6 md:space-y-8 ">
      <div className="pb-5 md:pb-6 border-b border-border/50">
        <div className="flex flex-col gap-0">
          <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            <span className="shrink-0 p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <tool.icon className="w-6 h-6" />
            </span>
            <span className="min-w-0 truncate">{tool.name}</span>
          </h1>

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
