import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ToolMetadata } from '../types';
import { TOOLS } from '../data/tools';
import { getRelatedTools } from '../lib/search/relatedTools';
import { cn } from '../lib/utils';

interface RelatedToolsProps {
  tool: ToolMetadata;
  className?: string;
}

const RelatedTools: React.FC<RelatedToolsProps> = ({ tool, className }) => {
  const relatedTools = useMemo(() => getRelatedTools(tool, TOOLS), [tool]);

  if (relatedTools.length === 0) return null;

  return (
    <section
      aria-labelledby="related-tools-heading"
      className={cn('pt-6 md:pt-8 border-t border-border/50', className)}
    >
      <h2
        id="related-tools-heading"
        className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1"
      >
        Related Tools
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {relatedTools.map((related) => (
          <Link
            key={related.id}
            to={`/${related.id}`}
            className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/40 hover:border-primary/30 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <related.icon className="w-4 h-4" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="truncate">{related.name}</span>
                <ArrowRight
                  className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  aria-hidden="true"
                />
              </span>
              <span className="block text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {related.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default React.memo(RelatedTools);
