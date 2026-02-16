import React from 'react';
import { cn } from '../lib/utils';
import { ToolMetadata } from '../types';

interface ToolPageLayoutProps {
  tool: ToolMetadata;
  children: React.ReactNode;
  className?: string;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool, children, className }) => {
  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <tool.icon className="w-6 h-6" />
          </span>
          {tool.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg ml-14">{tool.description}</p>
      </div>

      <div
        className={cn(
          'bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-sm transition-colors',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};

export default React.memo(ToolPageLayout);
