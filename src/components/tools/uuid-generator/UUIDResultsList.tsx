import React from 'react';
import { Fingerprint } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { CopyButton } from '../../ui/CopyButton';

interface UUIDResultsListProps {
  uuids: string[];
}

const UUIDResultsList: React.FC<UUIDResultsListProps> = ({ uuids }) => (
  <Card className="flex-1 min-h-[500px] border-border/60 shadow-md bg-muted/10 flex flex-col">
    <CardContent className="p-0 flex-1 relative flex flex-col">
      {uuids.length > 0 ? (
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {uuids.map((uuid, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-all hover:shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="text-xs font-mono text-muted-foreground w-6 text-right select-none opacity-50">
                {index + 1}.
              </span>
              <span className="font-mono text-sm sm:text-base text-foreground/90 flex-1 truncate select-all">
                {uuid}
              </span>
              <CopyButton
                value={uuid}
                className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus:opacity-100"
              />
            </div>
          ))}
          <div className="h-4" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground/50 select-none">
          <Fingerprint className="w-20 h-20 mb-6 opacity-10" />
          <p className="text-lg font-medium text-muted-foreground/70">Ready to generate</p>
          <p className="text-sm">Adjust settings and click Generate</p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default UUIDResultsList;
