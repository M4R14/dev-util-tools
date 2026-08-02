/**
 * Which descendants of a container Tab can actually reach.
 *
 * Split out from `useFocusTrap` because it is the part that got the trap wrong twice and the part
 * this project can test — components cannot be rendered in tests here, jsdom fails to boot.
 */

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Matches the element's own tab reachability; the selector alone is not enough. */
export const isTabReachable = (element: {
  tabIndex: number;
  getClientRects: () => { length: number };
}): boolean =>
  // A zero-size box means display:none or a hidden ancestor.
  element.getClientRects().length > 0 &&
  // `button` matches the selector even after being taken out of the tab order. The command
  // palette's options do exactly that — they are driven by aria-activedescendant, not by Tab — so
  // counting them would put the wrap point on an element Tab never reaches.
  element.tabIndex >= 0;

/**
 * Whether focus should be handed back to whatever held it before the trap opened.
 *
 * `orphaned` covers a dialog that unmounts on close: React detaches the container, the browser
 * drops focus onto `<body>`, and a containment check alone would decline to restore — leaving the
 * user at the top of the document. Focus moved somewhere else deliberately is left alone.
 */
export const shouldRestoreFocus = ({
  activeIsInsideContainer,
  activeIsBodyOrNull,
}: {
  activeIsInsideContainer: boolean;
  activeIsBodyOrNull: boolean;
}): boolean => activeIsInsideContainer || activeIsBodyOrNull;
