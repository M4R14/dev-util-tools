import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const SidebarBrand: React.FC = () => (
  <NavLink to="/">
    <div className="h-14 px-4 border-b border-border flex items-center gap-2.5">
      <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
        <LayoutDashboard className="w-5 h-5" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">
          DevPulse
        </h1>
        <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5">
          Developer Utility
        </p>
      </div>
    </div>
  </NavLink>
);

export default React.memo(SidebarBrand);
