import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import { readPersisted, writePersisted } from '../../lib/persistedState';
import type { SidebarSectionKey } from './navigationLayout';

const STORAGE_KEY = 'sidebar-collapsed-sections';

/**
 * Sections a reader can fold away, remembered across visits.
 *
 * The External group starts 960px down a 809px viewport, so those six tools sit below the fold no
 * matter how tall the window is. Trimming duplicate rows elsewhere only bought 64px — not enough —
 * so the list has to be foldable rather than merely shorter.
 *
 * `search` is deliberately not collapsible: it is the only section on screen while searching, and
 * hiding it would leave an empty sidebar.
 */
const COLLAPSIBLE: SidebarSectionKey[] = ['favorites', 'recent', 'apps', 'external'];

export const isCollapsible = (key: SidebarSectionKey) => (COLLAPSIBLE as string[]).includes(key);

const storedSchema = z.array(z.enum(['favorites', 'recent', 'apps', 'external']));

export const useCollapsedSections = () => {
  const [collapsed, setCollapsed] = useState<SidebarSectionKey[]>(() =>
    readPersisted(STORAGE_KEY, storedSchema, []),
  );

  const collapsedSet = useMemo(() => new Set(collapsed), [collapsed]);

  const toggleSection = useCallback((key: SidebarSectionKey) => {
    if (!isCollapsible(key)) return;

    setCollapsed((previous) => {
      const next = previous.includes(key)
        ? previous.filter((entry) => entry !== key)
        : [...previous, key];

      writePersisted(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { collapsedSections: collapsedSet, toggleSection };
};
