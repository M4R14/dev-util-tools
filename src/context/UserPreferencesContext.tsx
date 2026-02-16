import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ToolID } from '../types';
import { TOOLS } from '../data/tools';

interface UserPreferencesContextType {
  favorites: ToolID[];
  recents: ToolID[];
  toggleFavorite: (id: ToolID) => void;
  addRecent: (id: ToolID) => void;
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
  const [favorites, setFavorites] = useState<ToolID[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recents, setRecents] = useState<ToolID[]>(() => {
    const saved = localStorage.getItem('recents');
    return saved ? JSON.parse(saved) : [];
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('recents', JSON.stringify(recents));
  }, [recents]);

  const toggleFavorite = (id: ToolID) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
  };

  const addRecent = (id: ToolID) => {
    setRecents((prev) => {
      // Avoid adding if already at top
      if (prev[0] === id) return prev;

      const newRecents = [id, ...prev.filter((existingId) => existingId !== id)].slice(0, 8);
      return JSON.stringify(newRecents) !== JSON.stringify(prev) ? newRecents : prev;
    });
  };

  // Automatically update recents based on location/active tool
  useEffect(() => {
    const activeToolId = location.pathname.substring(1) as ToolID;
    const activeTool = TOOLS.find((t) => t.id === activeToolId);

    if (activeTool && activeTool.id) {
      addRecent(activeTool.id);
    }
  }, [location.pathname]);

  const value = {
    favorites,
    recents,
    toggleFavorite,
    addRecent,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};
