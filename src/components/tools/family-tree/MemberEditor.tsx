import React, { useEffect, useRef } from 'react';
import { Baby, Heart, Trash2, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { RELATIONSHIP_LIST_ID } from './AddMemberForm';
import type { FamilyMember, Gender } from '../../../lib/tools/familyTree';

export interface MemberEditorProps {
  member: FamilyMember;
  /** True when this member married in and shares their partner's slot. */
  isSpouse: boolean;
  onUpdate: (id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddPartner: (memberId: string) => void;
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

      <Input
        value={member.note}
        onChange={(event) => onUpdate(member.id, { note: event.target.value })}
        placeholder="Note"
        aria-label="Note"
        className="mb-2 h-8 text-xs"
        autoComplete="off"
      />

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
          disabled={Boolean(member.spouseId)}
          className="h-7 flex-1 px-2 text-xs"
          title={member.spouseId ? 'Already has a partner' : 'Add a partner'}
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
