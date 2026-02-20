import React from 'react';

const CommandPaletteFooter: React.FC = () => (
  <div className="px-4 py-3 bg-muted/50 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5">
        <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
          ↑
        </kbd>
        <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
          ↓
        </kbd>
        to navigate
      </span>
      <span className="flex items-center gap-1.5">
        <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 font-mono text-[10px]">
          ↵
        </kbd>
        to select
      </span>
    </div>
    <span>DevPulse Command Palette</span>
  </div>
);

export default CommandPaletteFooter;
