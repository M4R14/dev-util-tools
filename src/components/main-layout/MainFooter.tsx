import React from 'react';
import { NavLink } from 'react-router-dom';

const MainFooter: React.FC = () => (
  <footer className="px-4 py-3 text-muted-foreground text-xs border-t border-border/60 bg-background/80 backdrop-blur-sm">
    <div className="mx-auto flex max-w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <p className="text-center md:text-left">
        <span className="font-medium text-foreground/80">DevPulse</span> © {new Date().getFullYear()}{' '}
        • Privacy-first client-side processing
      </p>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
            isActive
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border/70 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
          }`
        }
      >
        App Settings
      </NavLink>
    </div>
  </footer>
);

export default MainFooter;
