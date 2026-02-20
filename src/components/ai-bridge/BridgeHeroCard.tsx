import React from 'react';
import { Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

const BridgeHeroCard: React.FC = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Workflow className="h-4 w-4 text-primary" />
          AI Agent Bridge
        </CardTitle>
        <CardDescription>
          Bridge สำหรับ AI/browser agents โดยรองรับ query execution, capability discovery และ
          schema validation ในหน้าเดียว
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        Query options: <code>mode=result-only</code>, <code>includeCatalog=false</code>
      </CardContent>
    </Card>
  );
};

export default BridgeHeroCard;
