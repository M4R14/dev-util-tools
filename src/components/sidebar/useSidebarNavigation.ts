import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolMetadata } from '../../types';
import { TOOLS } from '../../data/tools';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useSearch } from '../../context/SearchContext';
import { useToolSearch } from '../../hooks/useToolSearch';

const LIMIT_RECENTS = 3;
const EXTERNAL_TOOL_TAG = 'external tool';

export const useSidebarNavigation = (onClose: () => void) => {
  const { favorites, recents, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();
  const filteredTools = useToolSearch(searchTerm);
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const favoriteTools = useMemo(
    () => TOOLS.filter((t) => favorites.includes(t.id)),
    [favorites],
  );

  const recentTools = useMemo(
    () =>
      recents
        .map((id) => TOOLS.find((t) => t.id === id))
        .filter((t): t is ToolMetadata => !!t && !favorites.includes(t.id))
        .slice(0, LIMIT_RECENTS),
    [recents, favorites],
  );

  const isExternalTool = useCallback(
    (tool: ToolMetadata) => tool.tags?.includes(EXTERNAL_TOOL_TAG) ?? false,
    [],
  );

  const internalTools = useMemo(() => TOOLS.filter((tool) => !isExternalTool(tool)), [isExternalTool]);
  const externalTools = useMemo(() => TOOLS.filter((tool) => isExternalTool(tool)), [isExternalTool]);

  const groupedTools = useMemo(() => [...internalTools, ...externalTools], [internalTools, externalTools]);

  const visibleTools = useMemo(() => {
    if (searchTerm) {
      return filteredTools;
    }

    return [
      ...favoriteTools.map((t) => ({ ...t, _virtualId: `fav-${t.id}` })),
      ...recentTools.map((t) => ({ ...t, _virtualId: `rec-${t.id}` })),
      ...groupedTools.map((t) => ({ ...t, _virtualId: `all-${t.id}` })),
    ];
  }, [searchTerm, favoriteTools, recentTools, filteredTools, groupedTools]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      const isSearchInput =
        e.target instanceof HTMLInputElement &&
        e.target.type === 'text' &&
        e.target.placeholder.includes('Search');

      if (isInput && !isSearchInput) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % visibleTools.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + visibleTools.length) % visibleTools.length);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const tool = visibleTools[selectedIndex];
        if (tool) {
          navigate(`/${tool.id}`);
          if (window.innerWidth < 768) onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleTools, selectedIndex, navigate, onClose]);

  const renderToolLink = useCallback(
    (tool: ToolMetadata, contextPrefix: string, indexOffset: number) => ({
      tool,
      contextPrefix,
      indexOffset,
      selectedIndex,
      searchTerm,
      favorites,
    }),
    [selectedIndex, searchTerm, favorites],
  );

  return {
    searchTerm,
    setSearchTerm,
    filteredTools,
    favoriteTools,
    recentTools,
    selectedIndex,
    favorites,
    toggleFavorite,
    renderToolLink,
    tools: TOOLS,
    internalTools,
    externalTools,
  };
};

export type SidebarNavigationReturn = ReturnType<typeof useSidebarNavigation>;
