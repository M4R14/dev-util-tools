import React, { Suspense, lazy, useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import { ToolLayout } from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { CodeInput } from '../../ui/CodeInput';
import { AddMemberForm, RelationshipPresets } from './AddMemberForm';
import { TreeView } from './TreeView';
import { useFamilyTree } from '../../../hooks/tools/useFamilyTree';

/**
 * three.js is far larger than the rest of this tool put together, so the list renders and becomes
 * usable while WebGL is still on the wire.
 */
const FamilyScene = lazy(() => import('./FamilyScene'));

const FamilyTree: React.FC = () => {
  const {
    members,
    hierarchy,
    generations,
    addMember,
    updateMember,
    removeMember,
    reparentMember,
    clearAll,
    importJson,
    asJson,
  } = useFamilyTree();

  const [pendingParentId, setPendingParentId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleImport = () => {
    if (importJson(importText)) setImportText('');
  };

  return (
    <ToolLayout>
      <RelationshipPresets />

      <ToolLayout.Panel
        title="Add a member"
        className="mb-4"
        actions={
          members.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              {members.length} {members.length === 1 ? 'member' : 'members'} · {generations}{' '}
              {generations === 1 ? 'generation' : 'generations'}
            </span>
          ) : null
        }
      >
        <AddMemberForm
          members={members}
          defaultParentId={pendingParentId}
          onAdd={(input) => {
            addMember(input);
            setPendingParentId(input.parentId ?? null);
          }}
        />
      </ToolLayout.Panel>

      <ToolLayout.Panel
        title="Tree"
        className="mb-4"
        actions={
          members.length > 0 ? (
            <div className="flex items-center gap-1">
              <CopyButton value={asJson} label="Export" successMessage="Family tree copied as JSON" />
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
            {/*
              The canvas shows the shape; the list below is where the tree is actually operated.
              Keeping both means the tool stays usable from a keyboard and readable to a screen
              reader, neither of which a WebGL canvas offers.
            */}
            <Suspense
              fallback={
                <div className="flex h-[420px] items-center justify-center rounded-xl border border-border/60 text-sm text-muted-foreground">
                  Loading the 3D view…
                </div>
              }
            >
              <FamilyScene
                roots={hierarchy.roots}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Suspense>

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
