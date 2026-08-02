import React, { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { layoutFamilyTree2D } from '../../../lib/tools/familyTree/layout';
import { downloadPng, downloadSvg } from '../../../lib/platform/svgExport';
import { buildDiagramLabels } from './diagramLabels';
import { useDiagramViewport, ZOOM_STEP } from './useDiagramViewport';
import { DiagramToolbar } from './DiagramToolbar';
import { MemberNode } from './MemberNode';
import { MemberEditor } from './MemberEditor';
import type { FamilyMember, FamilyNode } from '../../../lib/tools/familyTree/types';

interface FamilyDiagramProps {
  roots: FamilyNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  orphanedIds: string[];
  cycleIds: string[];
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddPartner: (memberId: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSortChildren: (parentId: string) => void;
  /** Looks up the partners of a member's parent, for the second-parent choice. */
  partnersOfParent: (member: FamilyMember) => FamilyMember[];
  /** Set when the selected member was just created, so the editor can focus their name. */
  focusNewId: string | null;
}

/** Width of the editor card, needed to keep it from hanging off either edge of the diagram. */
const EDITOR_WIDTH = 256;

/**
 * The tree as a picture: layout in, SVG out.
 *
 * This file only composes. The geometry is `layout.ts`, one person is `MemberNode`, what is on
 * screen is `useDiagramViewport`, the chrome is `DiagramToolbar`, and editing is `MemberEditor`.
 */
export const FamilyDiagram: React.FC<FamilyDiagramProps> = ({
  roots,
  selectedId,
  onSelect,
  orphanedIds,
  cycleIds,
  collapsedIds,
  onToggleCollapse,
  onUpdate,
  onRemove,
  onAddChild,
  onAddPartner,
  onMove,
  onSortChildren,
  partnersOfParent,
  focusNewId,
}) => {
  const layout = useMemo(() => layoutFamilyTree2D(roots), [roots]);
  const { nodeWidth } = layout.metrics;
  const selectedBox = layout.boxes.find((box) => box.member.id === selectedId) ?? null;

  const labels = useMemo(
    () => buildDiagramLabels(layout.boxes, nodeWidth),
    [layout.boxes, nodeWidth],
  );

  /*
   * Stable identities so `MemberNode` can skip re-rendering. An arrow built per node per render
   * would fail its comparison every time and undo the memo.
   */
  const flagged = useMemo(
    () => new Set([...orphanedIds, ...cycleIds]),
    [orphanedIds, cycleIds],
  );

  const selectedRef = React.useRef(selectedId);
  selectedRef.current = selectedId;

  const toggleSelection = useCallback(
    (id: string) => onSelect(selectedRef.current === id ? null : id),
    [onSelect],
  );

  const viewport = useDiagramViewport({
    contentWidth: layout.width,
    contentHeight: layout.height,
    reveal: selectedBox
      ? { key: selectedBox.member.id, x: selectedBox.x, y: selectedBox.y }
      : null,
  });
  const { scale } = viewport;

  const svgRef = React.useRef<SVGSVGElement>(null);

  const exportImage = useCallback(async (kind: 'svg' | 'png') => {
    const svg = svgRef.current;
    if (!svg) return;

    try {
      if (kind === 'svg') {
        downloadSvg(svg, 'family-tree.svg');
      } else {
        // SVG has no background of its own, so a transparent PNG on a dark surface would be dark
        // text on dark.
        const background = getComputedStyle(document.body).backgroundColor || '#ffffff';
        await downloadPng(svg, 'family-tree.png', background);
      }

      toast.success(`Saved family-tree.${kind}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The diagram could not be exported.');
    }
  }, []);

  if (layout.boxes.length === 0) return null;

  return (
    <div className="space-y-2">
      <DiagramToolbar
        scale={scale}
        isFitted={viewport.isFitted}
        onZoomIn={() => viewport.zoomBy(ZOOM_STEP)}
        onZoomOut={() => viewport.zoomBy(-ZOOM_STEP)}
        onFit={viewport.fit}
        onExport={exportImage}
      />

      <div
        ref={viewport.scrollRef}
        {...viewport.panHandlers}
        /*
         * A fixed height, not one that grows with the tree. Fit reads this box to decide the scale,
         * so a height that followed the content would feed back into the number that produced it.
         * It also keeps a deep tree scrolling inside its own frame instead of stretching the page.
         */
        className="h-[60vh] max-h-[560px] min-h-[300px] w-full cursor-grab overflow-auto rounded-xl border border-border/60 bg-muted/10 p-2 active:cursor-grabbing"
      >
        {/*
          The editor is positioned inside this wrapper rather than over the scroll port, so it
          travels with the diagram instead of hovering in place while the tree slides underneath.
        */}
        <div
          className="relative"
          style={{ width: layout.width * scale, height: layout.height * scale }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width * scale}
            height={layout.height * scale}
            className="max-w-none touch-none select-none"
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
              const { id } = box.member;

              return (
                <MemberNode
                  key={id}
                  box={box}
                  label={labels.get(id)}
                  isSelected={id === selectedId}
                  isFlagged={flagged.has(id)}
                  isCollapsed={collapsedIds.has(id)}
                  metrics={layout.metrics}
                  onSelect={toggleSelection}
                  onToggleCollapse={onToggleCollapse}
                />
              );
            })}
          </svg>

          {selectedBox && (
            <div
              className="absolute z-10"
              style={{
                // Clamped so a member near either edge does not push the card out of the scroll area.
                left: Math.min(
                  Math.max(selectedBox.x * scale - EDITOR_WIDTH / 2, 0),
                  Math.max(layout.width * scale - EDITOR_WIDTH, 0),
                ),
                top: (selectedBox.y + layout.metrics.nodeHeight) * scale + 22,
              }}
            >
              <MemberEditor
                member={selectedBox.member}
                isSpouse={selectedBox.isSpouse}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddChild={onAddChild}
                onAddPartner={onAddPartner}
                onMove={onMove}
                onSortChildren={onSortChildren}
                hasChildren={selectedBox.childCount > 0 || selectedBox.hiddenDescendants > 0}
                parentPartners={partnersOfParent(selectedBox.member)}
                onClose={() => onSelect(null)}
                autoFocusName={focusNewId === selectedBox.member.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyDiagram;
