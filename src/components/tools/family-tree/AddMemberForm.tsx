import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { RELATIONSHIP_PRESETS, type CreateMemberInput, type FamilyMember } from '../../../lib/tools/familyTree';

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
  const [parentId, setParentId] = useState<string | null>(defaultParentId);

  // The row's "add child" button sets the parent; reflect it without stranding a typed-in choice.
  const [lastDefault, setLastDefault] = useState(defaultParentId);
  if (defaultParentId !== lastDefault) {
    setLastDefault(defaultParentId);
    setParentId(defaultParentId);
  }

  const canSubmit = name.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    onAdd({ name, relationship, note, parentId });
    setName('');
    setRelationship('');
    setNote('');
    // The parent stays put: adding four children to one person is the common run.
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

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Parent</span>
        <select
          value={parentId ?? ''}
          onChange={(event) => setParentId(event.target.value || null)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— no parent (root)</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name || 'Untitled'}
              {member.relationship ? ` (${member.relationship})` : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Note</span>
        <div className="flex gap-2">
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="เกิด 2510"
            autoComplete="off"
          />
          <Button type="submit" disabled={!canSubmit} className="shrink-0">
            <UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </label>
    </form>
  );
};
