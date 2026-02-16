import React from 'react';
import { Copy, RotateCcw } from 'lucide-react';

interface ToolLayoutProps {
  children: React.ReactNode;
  className?: string; // Additional classes
}

interface ToolSectionProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

interface ToolPanelProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ToolLayout: React.FC<ToolLayoutProps> & {
  Section: React.FC<ToolSectionProps>;
  Panel: React.FC<ToolPanelProps>;
} = ({ children, className = '' }) => {
  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {children}
    </div>
  );
};

const Section: React.FC<ToolSectionProps> = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="bg-white dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors">
        {children}
      </div>
    </div>
  );
};

const Panel: React.FC<ToolPanelProps> = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors ${className}`}>
        {(title || actions) && (
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
               {title && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>}
               {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        )}
        <div className="flex-1 p-4 relative text-slate-700 dark:text-slate-300">
            {children}
        </div>
    </div>
  );
};

ToolLayout.Section = Section;
ToolLayout.Panel = Panel;

export default ToolLayout;
