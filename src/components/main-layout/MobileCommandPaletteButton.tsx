import React from 'react';
import { Command } from 'lucide-react';
import { Button } from '../ui/Button';

interface MobileCommandPaletteButtonProps {
  onOpen: () => void;
}

const MobileCommandPaletteButton: React.FC<MobileCommandPaletteButtonProps> = ({ onOpen }) => (
  <div className="fixed bottom-4 right-4 z-40 md:hidden">
    <Button
      type="button"
      onClick={onOpen}
      className="h-10 rounded-full border border-primary/25 bg-background/90 px-4 shadow-lg backdrop-blur-md"
      aria-label="Open command palette"
    >
      <Command className="w-4 h-4 mr-2" aria-hidden="true" />
      <span className="text-xs font-semibold">Quick Search</span>
    </Button>
  </div>
);

export default MobileCommandPaletteButton;
