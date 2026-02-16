import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface ToolLayoutProps {
  children: React.ReactNode;
  className?: string; // Additional classes
}

interface ToolSectionProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

interface ToolPanelProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ToolLayout = ({ children, className }: ToolLayoutProps) => {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      {children}
    </div>
  );
};

const Section = ({ title, children, actions, className }: ToolSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-1">
          {title && (
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

const Panel = ({ title, children, actions, className }: ToolPanelProps) => {
  return (
    <Card className={cn("flex flex-col h-full overflow-hidden bg-background border-border shadow-sm", className)}>
        {(title || actions) && (
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b bg-muted/30">
               {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
               {actions && <div className="flex items-center gap-2">{actions}</div>}
            </CardHeader>
        )}
        <CardContent className="flex-1 p-4 relative text-foreground">
            {children}
        </CardContent>
    </Card>
  );
};

ToolLayout.Section = Section;
ToolLayout.Panel = Panel;

export default ToolLayout;
