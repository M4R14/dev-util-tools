import { useCallback, useState } from 'react';

const useBooleanState = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

export const useMainLayoutState = () => {
  const sidebar = useBooleanState();
  const commandPalette = useBooleanState();

  return {
    sidebar,
    commandPalette,
  };
};
