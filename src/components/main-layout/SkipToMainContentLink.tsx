import React from 'react';

interface SkipToMainContentLinkProps {
  targetId: string;
}

const SkipToMainContentLink: React.FC<SkipToMainContentLinkProps> = ({ targetId }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-primary/40"
  >
    Skip to main content
  </a>
);

export default SkipToMainContentLink;
