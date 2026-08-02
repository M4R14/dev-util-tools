import React, { useMemo } from 'react';
import { layoutFamilyTree2D } from '../../../lib/tools/familyTreeLayout';
import { cn } from '../../../lib/utils';
import type { FamilyNode } from '../../../lib/tools/familyTree';

interface FamilyDiagramProps {
  roots: FamilyNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * The conventional family-tree diagram, drawn as SVG.
 *
 * SVG rather than canvas or WebGL: the shapes are a few dozen rectangles and straight lines, every
 * one of them stays crisp at any zoom or pixel density for free, and each member can be a real
 * focusable element with a label — which is what lets the diagram itself be operated from the
 * keyboard instead of being an image with a separate list bolted on for accessibility.
 */
export const FamilyDiagram: React.FC<FamilyDiagramProps> = ({ roots, selectedId, onSelect }) => {
  const layout = useMemo(() => layoutFamilyTree2D(roots), [roots]);
  const { nodeWidth, nodeHeight, avatarSize } = layout.metrics;

  if (layout.boxes.length === 0) return null;

  return (
    <div className="w-full overflow-auto rounded-xl border border-border/60 bg-muted/10 p-2">
      {/*
        Scales down to fit the panel, never up past its natural size, and stops shrinking at 55%
        — below that the names stop being readable, so scrolling is the better trade.
      */}
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full"
        style={{ maxWidth: layout.width, minWidth: layout.width * 0.55 }}
        role="group"
        aria-label="Family tree diagram"
      >
        <g stroke="currentColor" className="text-border" strokeWidth={1.5} fill="none">
          {layout.connectors.map((connector, index) => (
            <polyline
              key={index}
              points={connector.points.map((point) => `${point.x},${point.y}`).join(' ')}
            />
          ))}
        </g>

        {layout.boxes.map((box) => {
          const isSelected = box.member.id === selectedId;
          const radius = avatarSize / 2;
          const centreY = box.y + radius;
          const detail = [box.member.relationship, box.member.note].filter(Boolean).join(' · ');

          return (
            <g
              key={box.member.id}
              onClick={() => onSelect(isSelected ? null : box.member.id)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onSelect(isSelected ? null : box.member.id);
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={detail ? `${box.member.name || 'Untitled'}, ${detail}` : box.member.name}
              className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-primary"
            >
              <circle
                cx={box.x}
                cy={centreY}
                r={radius}
                className={cn(
                  'transition-colors',
                  isSelected ? 'fill-primary/10 stroke-primary' : 'fill-card stroke-border',
                )}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />

              {/* A head and shoulders, the same silhouette the printed charts use. */}
              <g
                className={isSelected ? 'stroke-primary' : 'stroke-muted-foreground'}
                fill="none"
                strokeWidth={1.5}
              >
                <circle cx={box.x} cy={centreY - radius * 0.18} r={radius * 0.26} />
                <path
                  d={`M ${box.x - radius * 0.46} ${centreY + radius * 0.62}
                      a ${radius * 0.46} ${radius * 0.44} 0 0 1 ${radius * 0.92} 0`}
                />
              </g>

              <text
                x={box.x}
                y={box.y + avatarSize + 18}
                textAnchor="middle"
                className={cn(
                  'text-[13px] font-medium',
                  isSelected ? 'fill-primary' : 'fill-foreground',
                )}
              >
                {box.member.name || 'Untitled'}
              </text>

              {detail && (
                <text
                  x={box.x}
                  y={box.y + avatarSize + 33}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {detail.length > 22 ? `${detail.slice(0, 21)}…` : detail}
                </text>
              )}

              {/* Widens the click and focus target to the whole slot, not just the circle. */}
              <rect
                x={box.x - nodeWidth / 2}
                y={box.y}
                width={nodeWidth}
                height={nodeHeight}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default FamilyDiagram;
