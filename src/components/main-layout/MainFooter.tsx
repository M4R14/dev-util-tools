import React from 'react';

/**
 * Rendered inside the scroll container so it scrolls away with the content.
 *
 * It used to be a flex sibling of `<main>`, which kept it on screen permanently: 51px — 5% of the
 * viewport — held for a copyright line and an "App Settings" link that already existed in the
 * header two rows up. The link is gone; the line now waits at the bottom of the page.
 *
 * `role="contentinfo"` is explicit because a `<footer>` nested inside `<main>` does not get the
 * landmark implicitly, and losing it would cost screen reader users a page-level shortcut.
 */
const MainFooter: React.FC = () => (
  <footer
    role="contentinfo"
    className="mt-10 border-t border-border/60 px-1 py-4 text-center text-xs text-muted-foreground"
  >
    <span className="font-medium text-foreground/80">DevPulse</span> © {new Date().getFullYear()} •
    Privacy-first client-side processing
  </footer>
);

export default MainFooter;
