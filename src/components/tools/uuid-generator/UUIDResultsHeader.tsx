import React from 'react';
import {
  Copy,
  Download,
  Fingerprint,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface UUIDResultsHeaderProps {
  count: number;
  hasSecureUUID: boolean;
  onDownload: () => void;
  onClear: () => void;
  onCopyAll: () => void;
}

const UUIDResultsHeader: React.FC<UUIDResultsHeaderProps> = ({
  count,
  hasSecureUUID,
  onDownload,
  onClear,
  onCopyAll,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Fingerprint className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Generated UUIDs</h3>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">Standard RFC 4122 Version 4</p>
          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {count} items
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              hasSecureUUID
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            {hasSecureUUID ? (
              <>
                <ShieldCheck className="h-3 w-3" />
                Secure randomUUID
              </>
            ) : (
              <>
                <TriangleAlert className="h-3 w-3" />
                Fallback random
              </>
            )}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {count > 0 ? (
        <>
          <Button variant="outline" size="sm" onClick={onDownload} title="Download .txt">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={onClear} title="Clear List">
            <Trash2 className="w-4 h-4 sm:mr-2 text-muted-foreground" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          <Button variant="default" size="sm" onClick={onCopyAll} title="Copy All">
            <Copy className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Copy All</span>
          </Button>
        </>
      ) : null}
    </div>
  </div>
);

export default UUIDResultsHeader;
