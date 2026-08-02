import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import {
  RELATIONSHIP_PRESETS,
  type CreateMemberInput,
  type FamilyMember,
  type Gender,
} from '../../../lib/tools/familyTree/types';

interface AddMemberFormProps {
  members: FamilyMember[];
  /** Preselected parent, set when the row's "add child" button was used. */
  defaultParentId: string | null;
  onAdd: (input: CreateMemberInput) => void;
}

export const RELATIONSHIP_LIST_ID = 'family-relationship-presets';

/** A `<datalist>` so the Thai presets are one keystroke away without blocking anything else. */
export const RelationshipPresets: React.FC = () => (
  <datalist id={RELATIONSHIP_LIST_ID}>
    {RELATIONSHIP_PRESETS.map((preset) => (
      <option key={preset} value={preset} />
    ))}
  </datalist>
);

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  members,
  defaultParentId,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [note, setNote] = useState('');
  const [gender, setGender] = useState<Gender>('unknown');
  /** `''`, `child:<id>` or `spouse:<id>` — who to attach to and how, in one value. */
  const [attachment, setAttachment] = useState(defaultParentId ? `child:${defaultParentId}` : '');

  // The row's "add child" button sets the parent; reflect it without stranding a typed-in choice.
  const [lastDefault, setLastDefault] = useState(defaultParentId);
  if (defaultParentId !== lastDefault) {
    setLastDefault(defaultParentId);
    setAttachment(defaultParentId ? `child:${defaultParentId}` : '');
  }

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const [kind, id] = attachment.split(':');

    onAdd({
      name,
      relationship,
      note,
      gender,
      parentId: kind === 'child' ? id : null,
      spouseId: kind === 'spouse' ? id : null,
    });

    setName('');
    setRelationship('');
    setNote('');
    setGender('unknown');
    // A partner slot is filled once, so drop back to root; a parent stays put because adding four
    // children to the same person is the common run.
    if (kind === 'spouse') setAttachment('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Name</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="สมชาย ใจดี"
          autoComplete="off"
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Relationship</span>
        <Input
          value={relationship}
          onChange={(event) => setRelationship(event.target.value)}
          list={RELATIONSHIP_LIST_ID}
          placeholder="ลูกชาย"
          autoComplete="off"
        />
      </label>

      {/*
        One control rather than a Parent select beside a Partner select. Two would let someone pick
        both, and the tree would then have to refuse a combination the form had just offered.
      */}
      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Attach to</span>
        <select
          value={attachment}
          onChange={(event) => setAttachment(event.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— nobody (start a new root)</option>
          <optgroup label="Child of">
            {members.map((member) => (
              <option key={member.id} value={`child:${member.id}`}>
                {member.name || 'Untitled'}
              </option>
            ))}
          </optgroup>
          <optgroup label="Partner of">
            {members.map((member) => (
              <option key={member.id} value={`spouse:${member.id}`}>
                {member.name || 'Untitled'}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Note</span>
        <Input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="เกิด 2510"
          autoComplete="off"
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Gender</span>
        <div className="flex gap-2">
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value as Gender)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="unknown">Not set</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <Button type="submit" disabled={!canSubmit} className="shrink-0">
            <UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </label>
    </form>
  );
};
