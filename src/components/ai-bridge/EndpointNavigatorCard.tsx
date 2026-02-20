import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ENDPOINT_SPECS, type BridgeEndpointPath } from '../../data/aiBridge';

interface EndpointNavigatorCardProps {
  currentPath: string;
  onSwitch: (path: BridgeEndpointPath) => void;
}

const EndpointNavigatorCard: React.FC<EndpointNavigatorCardProps> = ({ currentPath, onSwitch }) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Endpoint Navigator</CardTitle>
        <CardDescription className="text-xs">
          Endpoint ปัจจุบัน: <code>{currentPath}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {ENDPOINT_SPECS.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              type="button"
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                isActive
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border/80 bg-background/60 hover:bg-muted/40',
              )}
              onClick={() => onSwitch(item.path)}
            >
              <div className="text-xs font-semibold text-foreground">{item.title}</div>
              <div className="text-[11px] text-muted-foreground">
                <code>{item.path}</code>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{item.summary}</div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EndpointNavigatorCard;
