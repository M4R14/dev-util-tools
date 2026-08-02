import React, { useState } from 'react';
import { Check, Heart, Pencil, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { cn } from '../../../lib/utils';
import { RELATIONSHIP_LIST_ID } from './AddMemberForm';
import type { FamilyMember, FamilyNode } from '../../../lib/tools/familyTree';

interface TreeViewProps {
  nodes: FamilyNode[];
  members: FamilyMember[];
  orphanedIds: string[];
  cycleIds: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => void;
  onRemove: (id: string) => void;
  onReparent: (id: string, parentId: string | null) => void;
  onLinkSpouse: (id: string, spouseId: string | null) => void;
  onAddChild: (id: string) => void;
}

type RowHandlers = Omit<TreeViewProps, 'nodes'>;

interface MemberRowProps extends RowHandlers {
  member: FamilyMember;
  /**
   * True for the partner who married in. They share their partner's slot in the diagram, so they
   * have no children of their own to add to.
   */
  isSpouse: boolean;
}

const selectClassName =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm';

const MemberRow: React.FC<MemberRowProps> = ({ member, isSpouse, members, ...rest }) => {
  const {
    orphanedIds,
    cycleIds,
    selectedId,
    onSelect,
    onUpdate,
    onRemove,
    onReparent,
    onLinkSpouse,
    onAddChild,
  } = rest;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(member);

  const startEditing = () => {
    setDraft(member);
    setIsEditing(true);
  };

  const commit = () => {
    onUpdate(member.id, {
      name: draft.name.trim(),
      relationship: draft.relationship.trim(),
      note: draft.note.trim(),
      gender: draft.gender,
    });

    if (draft.parentId !== member.parentId) onReparent(member.id, draft.parentId);
    if (draft.spouseId !== member.spouseId) onLinkSpouse(member.id, draft.spouseId);
    setIsEditing(false);
  };

  const isOrphaned = orphanedIds.includes(member.id);
  const isLooped = cycleIds.includes(member.id);
  const isSelected = selectedId === member.id;

  if (isEditing) {
    const others = members.filter((candidate) => candidate.id !== member.id);

    return (
      <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Name"
            aria-label="Name"
            autoFocus
          />
          <Input
            value={draft.relationship}
            onChange={(event) => setDraft({ ...draft, relationship: event.target.value })}
            list={RELATIONSHIP_LIST_ID}
            placeholder="Relationship"
            aria-label="Relationship"
          />
          <Input
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            placeholder="Note"
            aria-label="Note"
          />
          <label className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Parent</span>
            <select
              value={draft.parentId ?? ''}
              onChange={(event) => setDraft({ ...draft, parentId: event.target.value || null })}
              aria-label="Parent"
              className={selectClassName}
            >
              <option value="">— no parent (root)</option>
              {others.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name || 'Untitled'}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Gender</span>
            <select
              value={draft.gender}
              onChange={(event) =>
                setDraft({ ...draft, gender: event.target.value as FamilyMember['gender'] })
              }
              aria-label="Gender"
              className={selectClassName}
            >
              <option value="unknown">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Partner</span>
            <select
              value={draft.spouseId ?? ''}
              onChange={(event) => setDraft({ ...draft, spouseId: event.target.value || null })}
              aria-label="Partner"
              className={selectClassName}
            >
              <option value="">— none</option>
              {others
                .filter((candidate) => !candidate.spouseId || candidate.spouseId === member.id)
                .map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name || 'Untitled'}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button size="icon" onClick={commit} className="h-9 w-9 shrink-0" aria-label="Save">
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="h-9 w-9 shrink-0"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 transition-colors',
        isSelected && 'ring-2 ring-primary/50',
        isOrphaned || isLooped
          ? 'border-amber-500/40 bg-amber-500/5'
          : 'border-border/70 bg-card/60 hover:border-border',
      )}
    >
      {isSpouse && (
        <Heart className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}

      {/*
        Selecting from the list drives the same highlight the diagram does, so picking a name here
        tells you where that person sits without hunting for their face.
      */}
      <button
        type="button"
        onClick={() => onSelect(isSelected ? null : member.id)}
        className="font-medium text-foreground hover:text-primary"
        aria-pressed={isSelected}
      >
        {member.name || 'Untitled'}
      </button>

      {member.relationship && (
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          {member.relationship}
        </span>
      )}

      {member.note && <span className="text-xs text-muted-foreground">{member.note}</span>}

      {(isOrphaned || isLooped) && (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600">
          <TriangleAlert className="h-3 w-3" aria-hidden="true" />
          {isOrphaned ? 'parent is missing' : 'parent loops back'}
        </span>
      )}

      {/* Visible on focus as well as hover, so the row stays operable from the keyboard. */}
      <div className="ml-auto flex shrink-0 items-center opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {!isSpouse && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onAddChild(member.id)}
            className="h-8 w-8 text-muted-foreground"
            aria-label={`Add a child under ${member.name || 'this member'}`}
            title="Add child"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={startEditing}
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Edit ${member.name || 'this member'}`}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(member.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${member.name || 'this member'}`}
          title="Remove — children move up a level"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

interface BranchProps extends RowHandlers {
  node: FamilyNode;
}

const NodeBranch: React.FC<BranchProps> = ({ node, ...rest }) => (
  <li>
    <MemberRow {...rest} member={node.member} isSpouse={false} />

    {/*
      The married-in partner has no slot of their own in the diagram, so without a row here they
      would be in the picture but impossible to rename, re-link or remove.
    */}
    {node.spouse && (
      <div className="mt-1.5 pl-4 sm:pl-6">
        <MemberRow {...rest} member={node.spouse} isSpouse />
      </div>
    )}

    {node.children.length > 0 && (
      <ul className="mt-1.5 space-y-1.5 border-l border-border/70 pl-4 sm:pl-6">
        {node.children.map((child) => (
          <NodeBranch key={child.member.id} {...rest} node={child} />
        ))}
      </ul>
    )}
  </li>
);

export const TreeView: React.FC<TreeViewProps> = ({ nodes, ...rest }) => (
  <ul className="space-y-1.5">
    {nodes.map((node) => (
      <NodeBranch key={node.member.id} {...rest} node={node} />
    ))}
  </ul>
);
