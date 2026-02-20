import React from 'react';

interface MainContentWrapperProps {
  contentId: string;
  contentRef: React.RefObject<HTMLElement | null>;
  pageTitle: string;
  pageDescription: string;
  children: React.ReactNode;
}

const MainContentWrapper: React.FC<MainContentWrapperProps> = ({
  contentId,
  contentRef,
  pageTitle,
  pageDescription,
  children,
}) => (
  <main
    id={contentId}
    ref={contentRef}
    tabIndex={-1}
    className="flex-1 overflow-y-auto px-4 py-5 pb-20 md:px-8 md:py-8 lg:px-10 bg-gradient-to-b from-muted/35 via-background to-background scrollbar-thin scrollbar-thumb-border/70 dark:scrollbar-thumb-border/50 focus-visible:outline-none"
    aria-label={pageTitle}
    aria-description={pageDescription}
  >
    <div className="max-w-7xl mx-auto min-h-full animate-in fade-in duration-300">{children}</div>
  </main>
);

export default MainContentWrapper;
