import React, { useEffect, useRef } from 'react';
import {
  ArrowDownWideNarrow,
  Baby,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { RELATIONSHIP_LIST_ID } from './AddMemberForm';
import type { FamilyMember, Gender } from '../../../lib/tools/familyTree/types';

export interface MemberEditorProps {
  member: FamilyMember;
  /** True when this member married in and shares their partner's slot. */
  isSpouse: boolean;
  onUpdate: (id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddPartner: (memberId: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onSortChildren: (parentId: string) => void;
  /** Enables the sort action, which is meaningless on someone with nobody under them. */
  hasChildren: boolean;
  /** The partners of this member's parent, so a child of a remarriage can say which one. */
  parentPartners: FamilyMember[];
  onClose: () => void;
  /** Focus the name field on open — set when the member was created a moment ago. */
  autoFocusName: boolean;
}

const selectClassName =
  'flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs';

/**
 * Editing without leaving the picture.
 *
 * The list below the diagram could already do all of this, but it meant finding the same person
 * twice — once in the chart to see where they sit, once in the list to change anything. This card
 * opens on the member that was clicked and writes through on every keystroke, so there is no save
 * button to forget.
 */
export const MemberEditor: React.FC<MemberEditorProps> = ({
  member,
  isSpouse,
  onUpdate,
  onRemove,
  onAddChild,
  onAddPartner,
  onMove,
  onSortChildren,
  hasChildren,
  parentPartners,
  onClose,
  autoFocusName,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusName) nameRef.current?.select();
  }, [autoFocusName, member.id]);

  return (
    <div
      className="w-64 rounded-xl border border-border bg-popover p-3 shadow-lg"
      role="group"
      aria-label={`Edit ${member.name || 'this member'}`}
      // The diagram pans when the background is dragged; this card is not background.
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="mb-2 flex items-center gap-2">
        <Input
          ref={nameRef}
          value={member.name}
          onChange={(event) => onUpdate(member.id, { name: event.target.value })}
          placeholder="Name"
          aria-label="Name"
          className="h-8 text-sm"
          autoComplete="off"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 shrink-0 text-muted-foreground"
          aria-label="Close the editor"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <Input
          value={member.relationship}
          onChange={(event) => onUpdate(member.id, { relationship: event.target.value })}
          list={RELATIONSHIP_LIST_ID}
          placeholder="Relationship"
          aria-label="Relationship"
          className="h-8 text-xs"
          autoComplete="off"
        />
        <select
          value={member.gender}
          onChange={(event) => onUpdate(member.id, { gender: event.target.value as Gender })}
          aria-label="Gender"
          className={selectClassName}
        >
          <option value="unknown">Not set</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/*
        Free text, not date pickers. A family tree is filled in from memory and from the back of
        photographs — "2510", "ราวๆ 2495" — and a picker that demands a valid date turns "some time
        in the sixties" into a blank. Only the year is read out, and only for sorting and display.
      */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <Input
          value={member.birth}
          onChange={(event) => onUpdate(member.id, { birth: event.target.value })}
          placeholder="Born"
          aria-label="Born"
          className="h-8 text-xs"
          autoComplete="off"
        />
        <Input
          value={member.death}
          onChange={(event) => onUpdate(member.id, { death: event.target.value })}
          placeholder="Died"
          aria-label="Died"
          className="h-8 text-xs"
          autoComplete="off"
        />
      </div>

      <Input
        value={member.note}
        onChange={(event) => onUpdate(member.id, { note: event.target.value })}
        placeholder="Note"
        aria-label="Note"
        className="mb-2 h-8 text-xs"
        autoComplete="off"
      />

      {/*
        Which marriage this member came from. Only offered when their parent has more than one
        partner — with a single marriage there is nothing to choose, and the question would only
        raise a doubt that does not exist.
      */}
      {parentPartners.length > 1 && (
        <label className="mb-2 block space-y-1">
          <span className="text-[11px] text-muted-foreground">Second parent</span>
          <select
            value={member.otherParentId ?? ''}
            onChange={(event) => onUpdate(member.id, { otherParentId: event.target.value || null })}
            aria-label="Second parent"
            className={selectClassName}
          >
            <option value="">— not recorded</option>
            {parentPartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name || 'Untitled'}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Birth order is a real fact about a family, and the diagram reads eldest to youngest. */}
      <div className="mb-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMove(member.id, -1)}
          className="h-7 w-7 text-muted-foreground"
          aria-label="Move earlier among siblings"
          title="Move earlier among siblings"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMove(member.id, 1)}
          className="h-7 w-7 text-muted-foreground"
          aria-label="Move later among siblings"
          title="Move later among siblings"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSortChildren(member.id)}
            className="h-7 px-2 text-[11px] text-muted-foreground"
            title="Reorder this person's children oldest first"
          >
            <ArrowDownWideNarrow className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Sort children
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddChild(member.id)}
          className="h-7 flex-1 px-2 text-xs"
          // Children hang from the slot holder, so a child added from the married-in side is
          // attached to their partner rather than refused.
          title={isSpouse ? 'Add a child to this couple' : 'Add a child'}
        >
          <Baby className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Child
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddPartner(member.id)}
          className="h-7 flex-1 px-2 text-xs"
          // No longer capped at one: a second marriage is a thing family trees have to say.
          title={member.spouseIds.length > 0 ? 'Add another partner' : 'Add a partner'}
        >
          <Heart className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          Partner
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(member.id)}
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${member.name || 'this member'}`}
          title="Remove — children move up a level"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
