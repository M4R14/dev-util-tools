import React from 'react';
import { Command } from 'lucide-react';

interface CommandPaletteEmptyStateProps {
  searchTerm: string;
}

const CommandPaletteEmptyState: React.FC<CommandPaletteEmptyStateProps> = ({ searchTerm }) => (
  <div className="py-12 px-4 text-center text-muted-foreground">
    <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
    <p>
      No commands found matching &ldquo;<span className="text-foreground">{searchTerm}</span>&rdquo;
    </p>
  </div>
);

export default CommandPaletteEmptyState;
