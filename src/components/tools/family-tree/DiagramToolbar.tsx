import React from 'react';
import { Download, Maximize2, Minus, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';

interface DiagramToolbarProps {
  scale: number;
  isFitted: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onExport: (kind: 'svg' | 'png') => void;
}

/** The chrome around the diagram: how much of it you see, and how to take a copy away. */
export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  scale,
  isFitted,
  onZoomIn,
  onZoomOut,
  onFit,
  onExport,
}) => (
  <div className="flex flex-wrap items-center gap-1">
    <Button variant="outline" size="icon" onClick={onZoomOut} className="h-8 w-8" aria-label="Zoom out">
      <Minus className="h-4 w-4" />
    </Button>

    <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
      {Math.round(scale * 100)}%
    </span>

    <Button variant="outline" size="icon" onClick={onZoomIn} className="h-8 w-8" aria-label="Zoom in">
      <Plus className="h-4 w-4" />
    </Button>

    <Button
      variant={isFitted ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onFit}
      className="h-8 px-2 text-xs"
      aria-label="Fit the diagram to the panel"
      aria-pressed={isFitted}
      // Says which mode it is in. Zooming leaves fit mode, so the button lighting up on return is
      // the feedback that the click landed even when the scale happens not to change.
      title={isFitted ? 'Following the panel size' : 'Fit the whole tree in the panel'}
    >
      <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
      Fit
    </Button>

    <div className="ml-auto flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onExport('svg')} className="h-8 px-2 text-xs">
        <Download className="mr-1.5 h-3.5 w-3.5" />
        SVG
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onExport('png')} className="h-8 px-2 text-xs">
        <Download className="mr-1.5 h-3.5 w-3.5" />
        PNG
      </Button>
    </div>
  </div>
);
