import React, { useMemo, useState } from 'react';
import { Download, Trash2, UserPlus, Users } from 'lucide-react';
import { collapseHierarchy, flattenHierarchy } from '../../../lib/tools/familyTree/hierarchy';
import { ToolLayout } from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { CodeInput } from '../../ui/CodeInput';
import { AddMemberForm, RelationshipPresets } from './AddMemberForm';
import { TreeView } from './TreeView';
import { FamilyDiagram } from './FamilyDiagram';
import { MemberSearch } from './MemberSearch';
import { useFamilyTree } from '../../../hooks/tools/useFamilyTree';

const FamilyTree: React.FC = () => {
  const {
    members,
    hierarchy,
    generations,
    addMember,
    updateMember,
    removeMember,
    reparentMember,
    linkSpouse,
    unlinkSpouse,
    moveMember,
    sortChildren,
    clearAll,
    importJson,
    downloadJson,
    asJson,
  } = useFamilyTree();

  const [pendingParentId, setPendingParentId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /**
   * View state, not tree data — a fold is how someone is reading right now, and persisting it
   * would mean opening the tool to a tree with branches mysteriously missing.
   */
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const toggleCollapse = (id: string) =>
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const visibleRoots = useMemo(
    () => collapseHierarchy(hierarchy.roots, collapsedIds),
    [hierarchy.roots, collapsedIds],
  );

  /** The member just created from the diagram, so the editor can focus their empty name field. */
  const [focusNewId, setFocusNewId] = useState<string | null>(null);

  const createAndSelect = (input: Parameters<typeof addMember>[0]) => {
    const id = addMember(input);
    setSelectedId(id);
    setFocusNewId(id);
  };

  const addChildFromDiagram = (memberId: string) => {
    /*
     * Children hang from whichever partner holds the slot, so a child added from the married-in
     * side is attached to their partner rather than refused for standing on the wrong half.
     *
     * Which partner that is comes from the hierarchy, not from re-deriving it here: when neither
     * has a parent it is decided by who was added first, and a guess based on "no parent and has a
     * spouse" gets the slot holder themselves exactly backwards.
     */
    const holder = flattenHierarchy(hierarchy.roots).find(
      (node) => node.spouses.some((spouse) => spouse.id === memberId),
    );

    createAndSelect({ name: '', parentId: holder ? holder.member.id : memberId });
  };

  /**
   * The partners of a member's parent — the candidates for their second parent.
   *
   * Read off the members list rather than the hierarchy, because a member being edited may be a
   * root whose parent is not drawn as anyone's node.
   */
  const partnersOfParent = (member: (typeof members)[number]) => {
    const parent = members.find((entry) => entry.id === member.parentId);
    if (!parent) return [];

    return parent.spouseIds
      .map((id) => members.find((entry) => entry.id === id))
      .filter((entry): entry is (typeof members)[number] => Boolean(entry));
  };

  const handleImport = () => {
    if (importJson(importText)) setImportText('');
  };

  return (
    <ToolLayout>
      <RelationshipPresets />

      {/*
        The full form only exists while the tree is empty. Once anyone is on the canvas, adding is
        faster from the diagram — click a person, press Child, type — and this panel was a second,
        slower way to do the same job, sitting above the picture the whole time.
      */}
      {members.length === 0 && (
        <ToolLayout.Panel title="Add a member" className="mb-4">
          <AddMemberForm
            members={members}
            defaultParentId={pendingParentId}
            onAdd={(input) => {
              addMember(input);
              setPendingParentId(input.parentId ?? null);
            }}
          />
        </ToolLayout.Panel>
      )}

      <ToolLayout.Panel
        title="Tree"
        className="mb-4"
        actions={
          members.length > 0 ? (
            <div className="flex items-center gap-1">
              <span className="mr-1 text-xs text-muted-foreground">
                {members.length} {members.length === 1 ? 'member' : 'members'} · {generations}{' '}
                {generations === 1 ? 'generation' : 'generations'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => createAndSelect({ name: '' })}
                className="h-8 px-2 text-xs"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadJson}
                className="h-8 px-2 text-xs"
                title="Download the tree as a file"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                JSON
              </Button>
              <CopyButton value={asJson} label="Copy" successMessage="Family tree copied as JSON" />
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAll}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Clear the whole tree"
                title="Clear the whole tree"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        }
      >
        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Add the oldest person you know of first, then hang everyone else under them.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Leave <span className="font-medium">Parent</span> empty to start a new root.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* A tree past a screenful cannot be scanned by eye; selecting also scrolls to them. */}
            <MemberSearch members={members} onSelect={setSelectedId} />

            {/*
              Clicking someone in the diagram opens an editor on them, so the common edits never
              leave the picture. The list underneath keeps what the diagram has no room for —
              re-parenting, re-partnering, and a reading order that works without a mouse.
            */}
            <FamilyDiagram
              roots={visibleRoots}
              selectedId={selectedId}
              onSelect={setSelectedId}
              orphanedIds={hierarchy.orphanedIds}
              cycleIds={hierarchy.cycleIds}
              collapsedIds={collapsedIds}
              onToggleCollapse={toggleCollapse}
              onUpdate={updateMember}
              onRemove={(id) => {
                removeMember(id);
                setSelectedId(null);
              }}
              onAddChild={addChildFromDiagram}
              onAddPartner={(id) => createAndSelect({ name: '', spouseId: id })}
              onMove={moveMember}
              onSortChildren={sortChildren}
              partnersOfParent={partnersOfParent}
              focusNewId={focusNewId}
            />

            <TreeView
              nodes={hierarchy.roots}
              members={members}
              orphanedIds={hierarchy.orphanedIds}
              cycleIds={hierarchy.cycleIds}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdate={updateMember}
              onRemove={removeMember}
              onReparent={reparentMember}
              onLinkSpouse={linkSpouse}
              onUnlinkSpouse={unlinkSpouse}
              onAddChild={setPendingParentId}
            />
          </div>
        )}
      </ToolLayout.Panel>

      <details className="rounded-xl border border-border/70 px-4 py-3">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Import from JSON
        </summary>
        <div className="mt-3 space-y-2">
          <CodeInput
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste a tree exported from this tool"
            initialHeightClassName="h-32"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleImport} disabled={importText.trim().length === 0} size="sm">
              Import
            </Button>
            <span className="text-xs text-muted-foreground">Replaces the current tree.</span>
          </div>
        </div>
      </details>

      <p className="mt-4 text-xs text-muted-foreground">
        Saved in this browser only. Unlike the other tools here, the tree is kept out of the URL —
        a shareable link would carry your relatives&rsquo; names into browser history and link
        previews. Use <span className="font-medium">Export</span> to move it yourself.
      </p>
    </ToolLayout>
  );
};

export default FamilyTree;
