import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  appendMember,
  buildHierarchy,
  countGenerations,
  createMember,
  familyMembersSchema,
  isFamilyFailure,
  linkSpouse as linkSpouseInList,
  normalizeMembers,
  parseFamily,
  removeMember as removeFromList,
  reparentMember as reparentInList,
  serializeFamily,
  updateMember as updateInList,
  type CreateMemberInput,
  type FamilyMember,
} from '../../lib/tools/familyTree';
import { readPersisted, removePersisted, writePersisted } from '../../lib/platform/persistedState';

const STORAGE_KEY = 'family-tree';

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

  useEffect(() => {
    if (members.length === 0) {
      // Writing `[]` would resurrect an empty tree over a cleared one on the next visit.
      removePersisted(STORAGE_KEY);
      return;
    }

    writePersisted(STORAGE_KEY, members);
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

  const removeMember = useCallback((id: string) => {
    setMembers((previous) => {
      const target = previous.find((member) => member.id === id);
      const lifted = previous.filter((member) => member.parentId === id).length;
      const next = removeFromList(previous, id);

      if (target && lifted > 0) {
        // Say where they went. Silently re-parenting looks like the subtree was deleted too.
        toast.success(
          `Removed ${target.name || 'member'} — ${lifted} moved up to their place`,
        );
      } else if (target) {
        toast.success(`Removed ${target.name || 'member'}`);
      }

      return next;
    });
  }, []);

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

  const linkSpouse = useCallback((id: string, spouseId: string | null) => {
    setMembers((previous) => {
      const result = linkSpouseInList(previous, id, spouseId);

      if (isFamilyFailure(result)) {
        toast.error(result.reason);
        return previous;
      }

      return result.members;
    });
  }, []);

  const clearAll = useCallback(() => {
    setMembers([]);
    toast.success('Family tree cleared');
  }, []);

  const importJson = useCallback((raw: string) => {
    const result = parseFamily(raw);

    if (isFamilyFailure(result)) {
      toast.error(result.reason);
      return false;
    }

    setMembers(result.members);
    toast.success(`Imported ${result.members.length} members`);
    return true;
  }, []);

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
    clearAll,
    importJson,
    asJson,
  };
};
