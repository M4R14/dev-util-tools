import { useState, useEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolMetadata } from '../../types';
import { TOOLS } from '../../data/tools';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useSearch } from '../../context/SearchContext';
import { useToolSearch } from '../../hooks/useToolSearch';

const LIMIT_RECENTS = 3;
const EXTERNAL_TOOL_TAG = 'external tool';
const SEARCH_INPUT_ATTR = 'data-sidebar-search-input';
const TOOL_BY_ID = new Map(TOOLS.map((tool) => [tool.id, tool]));
const SIDEBAR_NAV_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Enter']);

const isExternalTool = (tool: ToolMetadata) => tool.tags?.includes(EXTERNAL_TOOL_TAG) ?? false;

const isSidebarSearchInput = (target: EventTarget | null) => {
  if (!(target instanceof HTMLInputElement)) {
    return false;
  }
  return target.getAttribute(SEARCH_INPUT_ATTR) === 'true';
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLElement && target.isContentEditable);

const useSidebarKeyboardNavigation = ({
  visibleTools,
  selectedIndex,
  setSelectedIndex,
  navigate,
  onClose,
}: {
  visibleTools: ToolMetadata[];
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
}) => {
  useEffect(() => {
    const totalVisibleTools = visibleTools.length;
    const hasVisibleTools = totalVisibleTools > 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!SIDEBAR_NAV_KEYS.has(event.key)) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target) && !isSidebarSearchInput(event.target)) {
        return;
      }

      if (event.key === 'ArrowDown') {
        if (!hasVisibleTools) {
          return;
        }
        event.preventDefault();
        setSelectedIndex((previous) => (previous + 1) % totalVisibleTools);
        return;
      }

      if (event.key === 'ArrowUp') {
        if (!hasVisibleTools) {
          return;
        }
        event.preventDefault();
        setSelectedIndex((previous) => (previous - 1 + totalVisibleTools) % totalVisibleTools);
        return;
      }

      if (event.key !== 'Enter' || selectedIndex < 0) {
        return;
      }

      if (event.repeat) {
        return;
      }

      event.preventDefault();
      const selectedTool = visibleTools[selectedIndex];
      if (!selectedTool) {
        return;
      }

      navigate(`/${selectedTool.id}`);
      if (window.innerWidth < 768) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onClose, selectedIndex, setSelectedIndex, visibleTools]);
};

export const useSidebarNavigation = (onClose: () => void) => {
  const { favorites, recents, toggleFavorite } = useUserPreferences();
  const { searchTerm, setSearchTerm } = useSearch();
  const filteredTools = useToolSearch(searchTerm);
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const hasSearchTerm = searchTerm.trim().length > 0;
  const favoriteToolIds = useMemo(() => new Set(favorites), [favorites]);

  const favoriteTools = useMemo(() => TOOLS.filter((tool) => favoriteToolIds.has(tool.id)), [favoriteToolIds]);

  const recentTools = useMemo(
    () =>
      recents
        .map((id) => TOOL_BY_ID.get(id))
        .filter((tool): tool is ToolMetadata => !!tool && !favoriteToolIds.has(tool.id))
        .slice(0, LIMIT_RECENTS),
    [recents, favoriteToolIds],
  );

  const internalTools = useMemo(() => TOOLS.filter((tool) => !isExternalTool(tool)), []);
  const externalTools = useMemo(() => TOOLS.filter((tool) => isExternalTool(tool)), []);
  const groupedTools = useMemo(() => [...internalTools, ...externalTools], [internalTools, externalTools]);

  const visibleTools = useMemo<ToolMetadata[]>(() => {
    if (hasSearchTerm) {
      return filteredTools;
    }

    return [
      ...favoriteTools,
      ...recentTools,
      ...groupedTools,
    ];
  }, [filteredTools, favoriteTools, groupedTools, hasSearchTerm, recentTools]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  useSidebarKeyboardNavigation({
    visibleTools,
    selectedIndex,
    setSelectedIndex,
    navigate,
    onClose,
  });

  return {
    searchTerm,
    setSearchTerm,
    filteredTools,
    favoriteTools,
    recentTools,
    selectedIndex,
    favorites,
    toggleFavorite,
    internalTools,
    externalTools,
  };
};

export type SidebarNavigationReturn = ReturnType<typeof useSidebarNavigation>;
