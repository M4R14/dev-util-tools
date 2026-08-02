import React from 'react';

interface MainContentWrapperProps {
  contentId: string;
  contentRef: React.RefObject<HTMLElement | null>;
  pageTitle: string;
  pageDescription: string;
  children: React.ReactNode;
  /** Rendered after the content, inside the scroll container, so it scrolls out of the way. */
  footer?: React.ReactNode;
}

const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  contentId,
  contentRef,
  pageTitle,
  pageDescription,
  children,
  footer,
}) => (
  <main
    id={contentId}
    ref={contentRef}
    tabIndex={-1}
    className="flex-1 overflow-y-auto px-4 py-5 pb-20 md:px-8 md:py-8 lg:px-10 bg-gradient-to-b from-muted/35 via-background to-background scrollbar-thin scrollbar-thumb-border/70 dark:scrollbar-thumb-border/50 focus-visible:outline-none"
    aria-label={pageTitle}
    aria-description={pageDescription}
  >
    {/*
      min-h-full was dropped from the content wrapper: with the footer now inside this container,
      forcing the content to fill the viewport pushed the footer permanently below the fold on
      short pages, which is the opposite of scrolling it into reach.
    */}
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">{children}</div>
    {footer && <div className="max-w-7xl mx-auto">{footer}</div>}
  </main>
);

export default MainContentWrapper;
