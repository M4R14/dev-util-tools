import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  appendMember,
  createMember,
  linkSpouse as linkSpouseInList,
  moveMember as moveInList,
  removeMember as removeFromList,
  reparentMember as reparentInList,
  sortChildrenByBirth,
  unlinkSpouse as unlinkInList,
  updateMember as updateInList,
} from '../../lib/tools/familyTree/members';
import { buildHierarchy, countGenerations } from '../../lib/tools/familyTree/hierarchy';
import {
  familyMembersSchema,
  normalizeMembers,
  parseFamily,
  serializeFamily,
} from '../../lib/tools/familyTree/storage';
import {
  isFamilyFailure,
  type CreateMemberInput,
  type FamilyMember,
} from '../../lib/tools/familyTree/types';
import { readPersisted, removePersisted, writePersisted } from '../../lib/platform/persistedState';
import { downloadText } from '../../lib/platform/download';

const STORAGE_KEY = 'family-tree';
/** Fixed id so the warning replaces itself rather than stacking one per keystroke. */
const STORAGE_ERROR_TOAST = 'family-tree-storage';
/** Long enough to notice the tree emptied and reach for the button. */
const UNDO_MS = 12_000;

/**
 * The tree lives in localStorage and nowhere else.
 *
 * Every other tool here puts its state in the URL so a link reproduces the work. This one holds
 * names of the owner's relatives, and a shareable link would carry them into browser history,
 * chat previews and any referrer header the page ever sends. Export is an explicit button instead.
 */
export const useFamilyTree = () => {
  const [members, setMembers] = useState<FamilyMember[]>(() =>
    normalizeMembers(readPersisted(STORAGE_KEY, familyMembersSchema, [])),
  );

  /**
   * Whether the last write reached storage.
   *
   * `writePersisted` returns `false` when localStorage refuses — a full quota, or Safari in private
   * mode — and this used to throw that answer away. Someone could spend an hour entering their
   * whole family, see every edit appear on screen, and lose all of it on the next reload with no
   * signal that anything was wrong. This tool has no value except the data typed into it, so a
   * failure to keep it is the one thing that must not be quiet.
   */
  const storageFailedRef = useRef(false);

  useEffect(() => {
    if (members.length === 0) {
      // Writing `[]` would resurrect an empty tree over a cleared one on the next visit.
      removePersisted(STORAGE_KEY);
      return;
    }

    const stored = writePersisted(STORAGE_KEY, members);

    if (!stored && !storageFailedRef.current) {
      storageFailedRef.current = true;
      // Not dismissed on its own: the reader has to see it, and the way out is to export now.
      toast.error('This browser refused to save the tree — export it before you close the tab.', {
        duration: Infinity,
        id: STORAGE_ERROR_TOAST,
      });
      return;
    }

    if (stored && storageFailedRef.current) {
      storageFailedRef.current = false;
      toast.dismiss(STORAGE_ERROR_TOAST);
      toast.success('Saving works again');
    }
  }, [members]);

  const hierarchy = useMemo(() => buildHierarchy(members), [members]);
  const generations = useMemo(() => countGenerations(hierarchy.roots), [hierarchy.roots]);

  /** Returns the new member's id so the caller can select and focus them straight away. */
  const addMember = useCallback((input: CreateMemberInput): string => {
    const created = createMember(input);
    setMembers((previous) => appendMember(previous, created));
    return created.id;
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<Omit<FamilyMember, 'id'>>) => {
    setMembers((previous) => updateInList(previous, id, patch));
  }, []);

  /**
   * Removing announces where the children went, and stays undoable.
   *
   * The toast is raised here rather than inside the state updater. React calls updaters twice under
   * StrictMode, so a side effect in one fires twice — this used to announce every deletion two
   * times in development.
   */
  const removeMember = useCallback(
    (id: string) => {
      const target = members.find((member) => member.id === id);
      if (!target) return;

      const lifted = members.filter((member) => member.parentId === id).length;
      const previous = members;

      setMembers(removeFromList(members, id));

      toast.success(
        lifted > 0
          ? `Removed ${target.name || 'member'} — ${lifted} moved up to their place`
          : `Removed ${target.name || 'member'}`,
        { duration: UNDO_MS, action: { label: 'Undo', onClick: () => setMembers(previous) } },
      );
    },
    [members],
  );

  const reparentMember = useCallback((id: string, parentId: string | null) => {
    setMembers((previous) => {
      const result = reparentInList(previous, id, parentId);

      if (isFamilyFailure(result)) {
        toast.error(result.reason);
        return previous;
      }

      return result.members;
    });
  }, []);

  const unlinkSpouse = useCallback((id: string, spouseId: string) => {
    setMembers((previous) => unlinkInList(previous, id, spouseId));
  }, []);

  const linkSpouse = useCallback((id: string, spouseId: string) => {
    setMembers((previous) => {
      const result = linkSpouseInList(previous, id, spouseId);

      if (isFamilyFailure(result)) {
        toast.error(result.reason);
        return previous;
      }

      return result.members;
    });
  }, []);

  /** Nudges someone past the sibling beside them, so birth order can be corrected. */
  const moveMember = useCallback((id: string, direction: -1 | 1) => {
    setMembers((previous) => moveInList(previous, id, direction));
  }, []);

  /** Reorders one person's children oldest first. Offered, never automatic — see members.ts. */
  const sortChildren = useCallback((parentId: string | null) => {
    setMembers((previous) => sortChildrenByBirth(previous, parentId));
    toast.success('Sorted by birth year');
  }, []);

  /**
   * Replaces the whole tree, keeping the old one within reach.
   *
   * Clearing and importing both throw away everything at once, and a confirmation dialog only ever
   * asks before the mistake. An undo answers the case that actually happens: the click already
   * landed, and the tree the owner spent an hour on is gone from the screen.
   */
  const replaceAll = useCallback(
    (next: FamilyMember[], message: string) => {
      const previous = members;
      setMembers(next);

      toast.success(message, {
        duration: UNDO_MS,
        action:
          previous.length > 0 ? { label: 'Undo', onClick: () => setMembers(previous) } : undefined,
      });
    },
    [members],
  );

  const clearAll = useCallback(() => replaceAll([], 'Family tree cleared'), [replaceAll]);

  const importJson = useCallback(
    (raw: string) => {
      const result = parseFamily(raw);

      if (isFamilyFailure(result)) {
        toast.error(result.reason);
        return false;
      }

      replaceAll(result.members, `Imported ${result.members.length} members`);
      return true;
    },
    [replaceAll],
  );

  const downloadJson = useCallback(() => {
    // Copying to the clipboard was the only way out, which is the easiest place to lose something.
    downloadText(serializeFamily(members), 'family-tree.json', 'application/json');
    toast.success('Saved family-tree.json');
  }, [members]);

  const asJson = useMemo(() => serializeFamily(members), [members]);

  return {
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
  };
};
