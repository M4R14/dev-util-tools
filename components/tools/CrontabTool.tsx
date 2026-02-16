import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';

const CrontabTool: React.FC = () => {
  return (
    <ToolLayout>
      <ToolLayout.Panel title="Crontab Guru" className="flex items-center justify-center p-12">
        <div className="text-center max-w-lg space-y-6">
          <div className="mx-auto w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-indigo-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-200">The Quick and Simple Cron Schedule Editor</h2>
          
          <p className="text-slate-400 leading-relaxed">
            Crontab.guru is a simple editor for cron schedule expressions. It's a quick and easy way to generate and understand cron schedule syntax.
          </p>

          <a 
            href="https://crontab.guru/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            Open Crontab Guru <ExternalLink className="w-4 h-4" />
          </a>
          
          <p className="text-xs text-slate-600 mt-8">
            Note: This link will open in a new tab.
          </p>
        </div>
      </ToolLayout.Panel>
    </ToolLayout>
  );
};

export default CrontabTool;
