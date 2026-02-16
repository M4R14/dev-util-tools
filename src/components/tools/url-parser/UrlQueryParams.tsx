import React from 'react';
import { Search } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import type { UrlParam } from '../../../hooks/useUrlParser';

interface UrlQueryParamsProps {
  params: UrlParam[];
  onParamChange: (index: number, key: string, value: string) => void;
}

const UrlQueryParams: React.FC<UrlQueryParamsProps> = ({ params, onParamChange }) => (
  <ToolLayout.Panel title={`Query Parameters (${params.length})`} className="bg-card/50">
    <div className="h-full flex flex-col pt-2">
      {params.length > 0 ? (
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-[1fr_2fr] gap-4 px-1 pb-2 border-b border-border/40 mb-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Value
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 flex-1 min-h-0">
            {params.map((param, index) => (
              <div key={index} className="grid grid-cols-[1fr_2fr] gap-4 items-start group">
                <div>
                  <Input
                    value={param.key}
                    onChange={(e) => onParamChange(index, e.target.value, param.value)}
                    className="font-mono text-xs bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Key"
                  />
                </div>
                <div>
                  <Textarea
                    value={param.value}
                    onChange={(e) => onParamChange(index, param.key, e.target.value)}
                    className="font-mono text-xs min-h-[38px] bg-muted/50 focus:bg-background transition-colors resize-y"
                    placeholder="Value"
                    rows={1}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/80 space-y-4 rounded-lg bg-muted/20 border-2 border-dashed border-primary/10 m-4">
          <div className="p-3 bg-background rounded-full border border-primary/20 shadow-sm mb-2">
            <Search className="w-8 h-8 text-primary/50" />
          </div>
          <div className="text-center px-4">
            <p className="font-semibold text-foreground">No parameters</p>
            <p className="text-xs opacity-70 mt-1">
              Add parameters to your URL and they will appear here automatically
            </p>
          </div>
        </div>
      )}
    </div>
  </ToolLayout.Panel>
);

export default UrlQueryParams;
