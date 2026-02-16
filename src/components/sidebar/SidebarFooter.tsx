import React from 'react';
import { Sparkles } from 'lucide-react';

const SidebarFooter: React.FC = () => (
  <div className="p-2 border-t border-border bg-muted/5">
    <div className="px-2 py-2 flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-default group">
      <div className="bg-primary/10 p-1 rounded-md text-primary group-hover:bg-primary/20 transition-colors">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <span className="font-medium">Gemini Powered</span>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto animate-pulse"></div>
    </div>
  </div>
);

export default React.memo(SidebarFooter);
