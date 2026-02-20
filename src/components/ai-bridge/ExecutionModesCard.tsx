import React from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

interface ExecutionModesCardProps {
  mode: 'full' | 'result-only';
  includeCatalog: boolean;
  disabled: boolean;
  onSetOption: (key: 'mode' | 'includeCatalog', value?: string) => void;
}

const ExecutionModesCard: React.FC<ExecutionModesCardProps> = ({
  mode,
  includeCatalog,
  disabled,
  onSetOption,
}) => {
  return (
    <Card className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Execution Modes</CardTitle>
        <CardDescription className="text-xs">
          Mode: <code>{mode}</code> | includeCatalog: <code>{String(includeCatalog)}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={mode === 'full' ? 'default' : 'outline'}
            disabled={disabled}
            onClick={() => onSetOption('mode', undefined)}
          >
            mode=full
          </Button>
          <Button
            size="sm"
            variant={mode === 'result-only' ? 'default' : 'outline'}
            disabled={disabled}
            onClick={() => onSetOption('mode', 'result-only')}
          >
            mode=result-only
          </Button>
        </div>
        <Button
          size="sm"
          variant={includeCatalog ? 'default' : 'outline'}
          disabled={disabled}
          onClick={() => onSetOption('includeCatalog', includeCatalog ? 'false' : undefined)}
        >
          includeCatalog={includeCatalog ? 'true' : 'false'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExecutionModesCard;
