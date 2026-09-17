import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ToolLayout } from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { API_KEY_HASH_COLUMN, type GeneratedApiKey } from '../../../lib/tools/apiKeyGenerator';

interface ApiKeyResultsPanelProps {
  keys: GeneratedApiKey[];
  revealed: boolean;
  onToggleReveal: () => void;
}

const MASK = '•'.repeat(48);

const ApiKeyResultsPanel: React.FC<ApiKeyResultsPanelProps> = ({
  keys,
  revealed,
  onToggleReveal,
}) => (
  <ToolLayout.Panel
    title={keys.length > 1 ? `Keys (${keys.length})` : 'Key'}
    actions={
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggleReveal}
        disabled={keys.length === 0}
      >
        {revealed ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {revealed ? 'Hide' : 'Reveal'}
      </Button>
    }
  >
    <div className="space-y-4">
      {keys.map((generated, index) => (
        <div
          key={generated.key}
          className="rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {keys.length > 1 ? `Key ${index + 1}` : 'Hand to the consumer, once'}
            </span>
            <CopyButton value={generated.key} label="key" successMessage="Key copied" />
          </div>

          <p className="mt-2 break-all font-mono text-sm font-semibold text-primary md:text-base">
            {revealed ? generated.key : MASK}
          </p>

          <dl className="mt-3 space-y-2 border-t border-border/60 pt-3 text-xs">
            {generated.lookupPrefix && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">prefix</dt>
                <dd className="flex min-w-0 items-center gap-1">
                  <span className="truncate font-mono">{generated.lookupPrefix}</span>
                  <CopyButton value={generated.lookupPrefix} successMessage="Prefix copied" />
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <dt className="font-mono text-muted-foreground">
                {API_KEY_HASH_COLUMN[generated.format]}
              </dt>
              <dd className="flex min-w-0 items-center gap-1">
                <span className="truncate font-mono">{generated.hash}</span>
                <CopyButton value={generated.hash} successMessage="Hash copied" />
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  </ToolLayout.Panel>
);

export default ApiKeyResultsPanel;
