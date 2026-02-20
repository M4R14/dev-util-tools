import React from 'react';

const BackgroundDecor: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
    <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.07),transparent_38%),radial-gradient(circle_at_78%_84%,hsl(var(--foreground)/0.04),transparent_34%)]" />
  </div>
);

export default BackgroundDecor;
