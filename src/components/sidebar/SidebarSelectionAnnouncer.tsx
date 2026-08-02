import React from 'react';
import type { ToolMetadata } from '../../types';
import { describeSidebarSelection } from './selectionMessage';

interface SidebarSelectionAnnouncerProps {
  tools: ToolMetadata[];
  selectedIndex: number;
}

/**
 * Speaks the arrow-key selection, which is otherwise conveyed by background colour alone.
 *
 * **Why a live region rather than `aria-activedescendant`.** The combobox pattern would be the
 * textbook answer, but it requires the items to be `role="option"` inside a `role="listbox"` that
 * owns them. These items are `NavLink`s nested several levels deep inside sections, so making that
 * structure valid would mean overriding the link role on every tool — and this is a navigation
 * landmark whose whole job is to expose links. Screen reader users would lose the ability to browse
 * it by links in exchange for a selection announcement.
 *
 * `aria-activedescendant` also only announces while focus is in the input that carries it, whereas
 * these arrow keys are handled globally. A live region announces the movement wherever focus is.
 *
 * The trade-off: this reports position but does not make the list a single tab stop the way a real
 * combobox would.
 */
export const SidebarSelectionAnnouncer: React.FC<SidebarSelectionAnnouncerProps> = ({
  tools,
  selectedIndex,
}) => (
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {describeSidebarSelection(tools, selectedIndex)}
  </div>
);
