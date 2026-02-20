import { useCallback, useState } from 'react';

export const useMainLayoutState = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((previous) => !previous);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((previous) => !previous);
  }, []);

  return {
    isSidebarOpen,
    isCommandPaletteOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
  };
};
