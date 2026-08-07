import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { DiagramLabel } from './diagramLabels';
import type { FamilyLayout2D, LaidOutMember } from '../../../lib/tools/familyTree/layout';

interface MemberNodeProps {
  box: LaidOutMember;
  label: DiagramLabel | undefined;
  isSelected: boolean;
  /** Their parent is missing or their chain loops — the same thing the list flags amber. */
  isFlagged: boolean;
  isCollapsed: boolean;
  metrics: FamilyLayout2D['metrics'];
  /** Take the id rather than a closure, so the handler can stay stable across renders. */
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

/** Keeps the flag, the selection and the ordinary state from being spelled out at four call sites. */
const outlineClass = (isFlagged: boolean, isSelected: boolean, ordinary: string): string =>
  isFlagged
    ? 'fill-amber-500/10 stroke-amber-500'
    : isSelected
      ? 'fill-primary/10 stroke-primary'
      : ordinary;

/**
 * One person in the diagram: their outline, silhouette, labels, warning badge and fold control.
 *
 * Everything is positioned from `box`, which the layout already worked out — nothing here decides
 * where anyone goes.
 */
export const MemberNode: React.FC<MemberNodeProps> = ({
  box,
  label,
  isSelected,
  isFlagged,
  isCollapsed,
  metrics,
  onSelect,
  onToggleCollapse,
}) => {
  const { nodeWidth, nodeHeight, avatarSize } = metrics;
  const { id, gender } = box.member;
  const radius = avatarSize / 2;
  const centreY = box.y + radius;
  const canFold = box.childCount > 0 || box.hiddenDescendants > 0;

  const activate = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };

  /*
   * Square for male, circle for female — the genealogy convention, and a difference of shape rather
   * than colour alone so it survives a colour-blind reader or a greyscale print. Unknown keeps the
   * circle but dashes the border, so it reads as "not recorded" rather than as a third gender.
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
        className={outlineClass(isFlagged, isSelected, 'fill-card stroke-sky-500/70')}
      />
    ) : (
      <circle
        cx={box.x}
        cy={centreY}
        r={radius}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={gender === 'unknown' ? '4 3' : undefined}
        className={outlineClass(
          isFlagged,
          isSelected,
          gender === 'female' ? 'fill-card stroke-rose-500/70' : 'fill-card stroke-border',
        )}
      />
    );

  return (
    <g data-member={id}>
      <g
        onClick={() => onSelect(id)}
        onKeyDown={(event) => activate(event, () => onSelect(id))}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={[label?.full, label?.detail, isFlagged ? 'needs attention' : '']
          .filter(Boolean)
          .join(', ')}
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

        {/* Widens the click and focus target to the whole slot, not just the outline. */}
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
          onKeyDown={(event) => activate(event, () => onToggleCollapse(id))}
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
           * Below the box, in the gap before the next generation. Sitting it just inside the box
           * put it exactly on the detail line — the count and the note drew over each other.
           */
          transform={`translate(${box.x} ${box.y + nodeHeight + 8})`}
        >
          <circle
            r={9}
            className={cn('stroke-border', isCollapsed ? 'fill-primary' : 'fill-card')}
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
};
