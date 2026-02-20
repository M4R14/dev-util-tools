import React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import type { UrlParam } from '../../../hooks/useUrlParser';

interface UrlQueryParamsProps {
  params: UrlParam[];
  onParamChange: (index: number, key: string, value: string) => void;
  onAddParam: () => void;
  onRemoveParam: (index: number) => void;
}

const UrlQueryParams: React.FC<UrlQueryParamsProps> = ({
  params,
  onParamChange,
  onAddParam,
  onRemoveParam,
}) => {
  const queryString = React.useMemo(() => {
    const searchParams = new URLSearchParams();
    params.forEach((param) => {
      if (param.key) {
        searchParams.append(param.key, param.value);
      }
    });

    const serialized = searchParams.toString();
    return serialized ? `?${serialized}` : '';
  }, [params]);

  return (
    <ToolLayout.Panel
      title={`Query Parameters (${params.length})`}
      className="bg-card/50"
      actions={
        <Button variant="outline" size="sm" onClick={onAddParam} className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      }
    >
      <div className="h-full flex flex-col gap-4 pt-1">
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Query string</p>
            <CopyButton value={queryString} disabled={!queryString} className="h-7 w-7" />
          </div>
          <p className="font-mono text-xs break-all text-foreground/90">{queryString || '--'}</p>
        </div>

        {params.length > 0 ? (
          <div className="flex flex-col h-full min-h-0">
            <div className="hidden sm:grid sm:grid-cols-[1fr_2fr_auto] gap-3 px-1 pb-2 border-b border-border/40 mb-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Key
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Value
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Remove
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-0">
              {params.map((param, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-border/50 bg-background/60 p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start sm:gap-3 sm:p-2.5"
                >
                  <Input
                    value={param.key}
                    onChange={(e) => onParamChange(index, e.target.value, param.value)}
                    className="font-mono text-xs bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Key"
                    aria-label={`Query key ${index + 1}`}
                  />
                  <Textarea
                    value={param.value}
                    onChange={(e) => onParamChange(index, param.key, e.target.value)}
                    className="font-mono text-xs min-h-[38px] bg-muted/50 focus:bg-background transition-colors resize-y"
                    placeholder="Value"
                    rows={1}
                    aria-label={`Query value ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveParam(index)}
                    className="h-8 w-8 justify-self-end text-muted-foreground hover:text-destructive"
                    aria-label={`Remove query parameter ${index + 1}`}
                    title="Remove parameter"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/80 space-y-4 rounded-lg bg-muted/20 border-2 border-dashed border-primary/10 p-6">
            <div className="p-3 bg-background rounded-full border border-primary/20 shadow-sm">
              <Search className="w-8 h-8 text-primary/50" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No query parameters</p>
              <p className="text-xs opacity-70 mt-1 max-w-[280px]">
                Add your first parameter here. Changes will update the URL automatically.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onAddParam} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add first parameter
            </Button>
          </div>
        )}
      </div>
    </ToolLayout.Panel>
  );
};

export default UrlQueryParams;
