import React from 'react';

const SidebarEmptyState: React.FC = () => (
  <div className="px-3 py-8 text-center border border-dashed border-border/70 rounded-md bg-muted/20">
    <p className="text-xs font-medium text-foreground">No tools found</p>
    <p className="mt-1 text-[11px] text-muted-foreground">Try a different keyword</p>
  </div>
);

export default SidebarEmptyState;
