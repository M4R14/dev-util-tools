import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { ToolID } from '../types';
import { TOOLS } from '../data/tools';
import { resolvePageMeta } from '../lib/pageMeta';
import { readPersisted, writePersisted } from '../lib/persistedState';

const RECENTS_LIMIT = 8;

const toolIdListSchema = z.array(z.string());

/**
 * Tools get renamed and removed, so a stored id is not guaranteed to still exist. Dropping unknown
 * ids on read means the sidebar count and the stored list agree — they used to drift, because the
 * UI filtered unknown ids out while storage kept them forever.
 */
const readToolIds = (key: string): ToolID[] => {
  const stored = readPersisted(key, toolIdListSchema, []);
  const known = new Set(TOOLS.map((tool) => tool.id));

  return stored.filter((id): id is ToolID => known.has(id as ToolID));
};

interface UserPreferencesContextType {
  favorites: ToolID[];
  recents: ToolID[];
  toggleFavorite: (id: ToolID) => void;
  addRecent: (id: ToolID) => void;
  clearFavorites: () => void;
  clearRecents: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<ToolID[]>(() => readToolIds('favorites'));
  const [recents, setRecents] = useState<ToolID[]>(() => readToolIds('recents'));

  const location = useLocation();

  useEffect(() => {
    writePersisted('favorites', favorites);
  }, [favorites]);

  useEffect(() => {
    writePersisted('recents', recents);
  }, [recents]);

  const toggleFavorite = useCallback((id: ToolID) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
  }, []);

  const addRecent = useCallback((id: ToolID) => {
    setRecents((prev) => {
      if (prev[0] === id) return prev;
      return [id, ...prev.filter((existingId) => existingId !== id)].slice(0, RECENTS_LIMIT);
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);
  const clearRecents = useCallback(() => setRecents([]), []);

  // resolvePageMeta normalises the pathname (trailing slash, base path) before matching, which
  // the previous `pathname.substring(1)` did not.
  useEffect(() => {
    const { activeTool } = resolvePageMeta(location.pathname);
    if (activeTool) {
      addRecent(activeTool.id);
    }
  }, [addRecent, location.pathname]);

  /**
   * Memoised because this provider re-renders on every navigation (it reads useLocation), and an
   * identity-unstable value re-renders every consumer — the whole sidebar included — each time.
   */
  const value = useMemo(
    () => ({
      favorites,
      recents,
      toggleFavorite,
      addRecent,
      clearFavorites,
      clearRecents,
    }),
    [favorites, recents, toggleFavorite, addRecent, clearFavorites, clearRecents],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};
