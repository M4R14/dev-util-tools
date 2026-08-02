import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Maximize2, Minus, Plus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/Button';
import { layoutFamilyTree2D } from '../../../lib/tools/familyTreeLayout';
import { createCanvasMeasurer, truncateToWidth } from '../../../lib/tools/svgText';
import { downloadPng, downloadSvg } from '../../../lib/platform/svgExport';
import { prefersReducedMotion } from '../../../lib/platform/motion';
import { cn } from '../../../lib/utils';
import { MemberEditor } from './MemberEditor';
import type { FamilyMember, FamilyNode } from '../../../lib/tools/familyTree';

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
  /** Set when the selected member was just created, so the editor can focus their name. */
  focusNewId: string | null;
}

/** Width of the editor card, needed to keep it from hanging off either edge of the diagram. */
const EDITOR_WIDTH = 256;

/**
 * Never shrinks past this. The first version allowed 55%, which turned out to be the worst of both
 * worlds: a fourteen-sibling generation rendered its names at seven pixels — unreadable — and still
 * needed horizontal scrolling. Below this, scrolling at a legible size is the better trade.
 */
const MIN_FIT_SCALE = 0.85;
const ZOOM_STEP = 0.2;
const ZOOM_RANGE = { min: 0.4, max: 2.5 };

const NAME_FONT = '500 13px system-ui, -apple-system, "Noto Sans Thai", sans-serif';
const DETAIL_FONT = '400 11px system-ui, -apple-system, "Noto Sans Thai", sans-serif';

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
  focusNewId,
}) => {
  const layout = useMemo(() => layoutFamilyTree2D(roots), [roots]);
  const { nodeWidth, nodeHeight, avatarSize } = layout.metrics;
  const selectedBox = layout.boxes.find((box) => box.member.id === selectedId) ?? null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  /** `null` means "fit the panel"; a number is an explicit zoom the reader chose. */
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale =
    viewportWidth === 0 || layout.width === 0
      ? 1
      : Math.min(1, Math.max(MIN_FIT_SCALE, viewportWidth / layout.width));
  const scale = zoom ?? fitScale;

  /**
   * Labels are truncated against a real measurement of the font they will be drawn in.
   *
   * SVG `<text>` neither wraps nor clips, so a long name simply runs over its neighbour — two
   * Thai names at 140px in a 116px slot overlapped into an unreadable smear. Measuring beats
   * counting characters: the old code cut notes at 22 characters and left names alone entirely,
   * which is both inconsistent and wrong for scripts where glyph widths vary.
   */
  const labels = useMemo(() => {
    const measureName = createCanvasMeasurer(NAME_FONT);
    const measureDetail = createCanvasMeasurer(DETAIL_FONT);
    const available = nodeWidth - 8;

    return new Map(
      layout.boxes.map((box) => {
        const full = box.member.name || 'Untitled';
        const detail = [box.member.relationship, box.member.note].filter(Boolean).join(' · ');

        return [
          box.member.id,
          {
            full,
            detail,
            name: truncateToWidth(full, available, measureName),
            shortDetail: truncateToWidth(detail, available, measureDetail),
          },
        ];
      }),
    );
  }, [layout.boxes, nodeWidth]);

  /**
   * Brings the selected member into view.
   *
   * Selection is shared with the list, and on a wide tree the person picked there was routinely
   * off-screen in the diagram with nothing to say so.
   */
  const scrolledToRef = useRef<string | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    const box = layout.boxes.find((entry) => entry.member.id === selectedId);
    if (!container || !box) return;

    /*
     * Only on a change of selection. The editor writes through on every keystroke, which rebuilds
     * the layout, which would otherwise re-centre the diagram under the cursor on every letter
     * typed into a name.
     */
    if (scrolledToRef.current === selectedId) return;
    scrolledToRef.current = selectedId;

    container.scrollTo({
      left: box.x * scale - container.clientWidth / 2,
      top: box.y * scale - container.clientHeight / 2,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [selectedId, layout.boxes, scale]);

  const adjustZoom = (delta: number) =>
    setZoom((current) =>
      Math.min(ZOOM_RANGE.max, Math.max(ZOOM_RANGE.min, (current ?? fitScale) + delta)),
    );

  /** Drag anywhere empty to pan, so a big tree does not have to be chased with scrollbars. */
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    // Let clicks on a member reach the member.
    if ((event.target as Element).closest('[data-member]')) return;

    const container = scrollRef.current;
    if (!container) return;

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: container.scrollLeft,
      top: container.scrollTop,
    };
    container.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const container = scrollRef.current;
    if (!drag || !container) return;

    container.scrollLeft = drag.left - (event.clientX - drag.x);
    container.scrollTop = drag.top - (event.clientY - drag.y);
  };

  const endDrag = (event: React.PointerEvent) => {
    dragRef.current = null;
    scrollRef.current?.releasePointerCapture(event.pointerId);
  };

  const exportImage = useCallback(
    async (kind: 'svg' | 'png') => {
      const svg = svgRef.current;
      if (!svg) return;

      try {
        if (kind === 'svg') {
          downloadSvg(svg, 'family-tree.svg');
        } else {
          // SVG has no background of its own, so a transparent PNG on a dark surface would be
          // dark text on dark.
          const background = getComputedStyle(document.body).backgroundColor || '#ffffff';
          await downloadPng(svg, 'family-tree.png', background);
        }

        toast.success(`Saved family-tree.${kind}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'The diagram could not be exported.');
      }
    },
    [],
  );

  if (layout.boxes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustZoom(-ZOOM_STEP)}
          className="h-8 w-8"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustZoom(ZOOM_STEP)}
          className="h-8 w-8"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(null)}
          className="h-8 px-2 text-xs"
          aria-label="Fit the diagram to the panel"
        >
          <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
          Fit
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportImage('svg')}
            className="h-8 px-2 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            SVG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportImage('png')}
            className="h-8 px-2 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            PNG
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="w-full cursor-grab overflow-auto rounded-xl border border-border/60 bg-muted/10 p-2 active:cursor-grabbing"
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
            const { id, gender } = box.member;
            const isSelected = id === selectedId;
            const isFlagged = orphanedIds.includes(id) || cycleIds.includes(id);
            const label = labels.get(id);
            const radius = avatarSize / 2;
            const centreY = box.y + radius;
            const isCollapsed = collapsedIds.has(id);
            const canFold = box.childCount > 0 || box.hiddenDescendants > 0;

            /*
             * Square for male, circle for female — the genealogy convention, and shape rather than
             * colour alone so the distinction survives a colour-blind reader or a greyscale print.
             */
            const outline =
              gender === 'male' ? (
                <rect
                  x={box.x - radius}
                  y={box.y}
                  width={avatarSize}
                  height={avatarSize}
                  rx={10}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className={cn(
                    isFlagged
                      ? 'fill-amber-500/10 stroke-amber-500'
                      : isSelected
                        ? 'fill-primary/10 stroke-primary'
                        : 'fill-card stroke-sky-500/70',
                  )}
                />
              ) : (
                <circle
                  cx={box.x}
                  cy={centreY}
                  r={radius}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={gender === 'unknown' ? '4 3' : undefined}
                  className={cn(
                    isFlagged
                      ? 'fill-amber-500/10 stroke-amber-500'
                      : isSelected
                        ? 'fill-primary/10 stroke-primary'
                        : gender === 'female'
                          ? 'fill-card stroke-rose-500/70'
                          : 'fill-card stroke-border',
                  )}
                />
              );

            return (
              <g key={id} data-member={id}>
                <g
                  onClick={() => onSelect(isSelected ? null : id)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    onSelect(isSelected ? null : id);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={
                    [label?.full, label?.detail, isFlagged ? 'needs attention' : '']
                      .filter(Boolean)
                      .join(', ')
                  }
                  className="cursor-pointer outline-none"
                >
                  {outline}

                  <g
                    className={cn(
                      'pointer-events-none',
                      isFlagged
                        ? 'stroke-amber-600'
                        : isSelected
                          ? 'stroke-primary'
                          : 'stroke-muted-foreground',
                    )}
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
                      'pointer-events-none text-[13px] font-medium',
                      isSelected ? 'fill-primary' : 'fill-foreground',
                    )}
                  >
                    {label?.name}
                  </text>

                  {label?.shortDetail && (
                    <text
                      x={box.x}
                      y={box.y + avatarSize + 33}
                      textAnchor="middle"
                      className="pointer-events-none fill-muted-foreground text-[11px]"
                    >
                      {label.shortDetail}
                    </text>
                  )}

                  {/* Full text for anyone whose label had to be cut. */}
                  <title>{[label?.full, label?.detail].filter(Boolean).join(' — ')}</title>

                  <rect
                    x={box.x - nodeWidth / 2}
                    y={box.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    fill="transparent"
                  />
                </g>

                {isFlagged && (
                  <g
                    transform={`translate(${box.x + radius - 6} ${box.y - 2})`}
                    className="pointer-events-none"
                  >
                    <circle r={8} className="fill-amber-500" />
                    <TriangleAlert x={-5} y={-5} width={10} height={10} className="stroke-white" />
                  </g>
                )}

                {canFold && (
                  <g
                    onClick={() => onToggleCollapse(id)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      onToggleCollapse(id);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={!isCollapsed}
                    aria-label={
                      isCollapsed
                        ? `Show ${box.hiddenDescendants} hidden under ${label?.full}`
                        : `Hide the branch under ${label?.full}`
                    }
                    className="cursor-pointer outline-none"
                    /*
                     * Below the box, in the gap before the next generation. Sitting it just inside
                     * the box put it exactly on the detail line — the count and the note drew over
                     * each other.
                     */
                    transform={`translate(${box.x} ${box.y + nodeHeight + 8})`}
                  >
                    <circle
                      r={9}
                      className={cn(
                        'stroke-border',
                        isCollapsed ? 'fill-primary' : 'fill-card',
                      )}
                      strokeWidth={1.5}
                    />
                    <text
                      textAnchor="middle"
                      y={3.5}
                      className={cn(
                        'pointer-events-none text-[9px] font-semibold',
                        isCollapsed ? 'fill-primary-foreground' : 'fill-muted-foreground',
                      )}
                    >
                      {/* The count is the point: a bare chevron hides how much is behind it. */}
                      {isCollapsed ? box.hiddenDescendants : '−'}
                    </text>
                  </g>
                )}
              </g>
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
              top: (selectedBox.y + nodeHeight) * scale + 22,
            }}
          >
            <MemberEditor
              member={selectedBox.member}
              isSpouse={selectedBox.isSpouse}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onAddPartner={onAddPartner}
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
