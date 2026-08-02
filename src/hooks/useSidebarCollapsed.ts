import { useCallback, useState } from 'react';
import { z } from 'zod';
import { readPersisted, writePersisted } from '../lib/platform/persistedState';

const STORAGE_KEY = 'sidebar-collapsed';

/**
 * Whether the desktop sidebar is hidden, remembered across visits.
 *
 * Distinct from `useMainLayoutState().sidebar`, which is the mobile overlay's open/closed state:
 * below `md` the sidebar is a drawer that is closed by default, above `md` it is a permanent
 * column. This flag only governs the permanent column, so hiding it on a laptop does not also
 * change what the hamburger button does on a phone.
 *
 * Navigation survives the hide: every tool stays reachable through the command palette, which is
 * why full-width reclaim is offered rather than an icon rail.
 */
export const useSidebarCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(() =>
    readPersisted(STORAGE_KEY, z.boolean(), false),
  );

  const toggle = useCallback(() => {
    setIsCollapsed((previous) => {
      const next = !previous;
      writePersisted(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { isCollapsed, toggle };
};
