import type { ToolMetadata } from '../../types';

/**
 * The sentence a screen reader speaks when the arrow-key selection moves.
 *
 * Split out from the component because this project cannot render components in tests — jsdom
 * fails to boot here — so the wording and the edge cases are covered as pure logic instead.
 *
 * Returns an empty string whenever there is nothing to report, which keeps the live region silent
 * rather than announcing a blank or a stale entry.
 */
export const describeSidebarSelection = (tools: ToolMetadata[], selectedIndex: number): string => {
  const selected = selectedIndex >= 0 ? tools[selectedIndex] : undefined;
  if (!selected) return '';

  return `${selected.name}, ${selectedIndex + 1} of ${tools.length}`;
};
