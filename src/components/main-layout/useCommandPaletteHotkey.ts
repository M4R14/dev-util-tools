import { useEffect, useRef } from 'react';

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return true;
  }

  return target.closest('[contenteditable]:not([contenteditable="false"])') !== null;
};

export const useCommandPaletteHotkey = (onToggle: () => void) => {
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.isComposing) {
        return;
      }

      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      onToggleRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
