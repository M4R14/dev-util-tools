import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ToolLayout } from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { cn } from '../../../lib/utils';
import {
  API_KEY_QUANTITY_BOUNDS,
  API_KEY_VENDOR_PREFIX_MAX_LENGTH,
  DEFAULT_API_KEY_VENDOR_PREFIX,
  type ApiKeyEnvironment,
  type ApiKeyFormat,
} from '../../../lib/tools/apiKeyGenerator';
import { buildFormatOptions, ENVIRONMENT_OPTIONS, QUANTITY_PRESETS } from './constants';

interface ApiKeyOptionsPanelProps {
  environment: ApiKeyEnvironment;
  format: ApiKeyFormat;
  /** What was typed, which may not yet be usable. */
  vendorPrefixInput: string;
  /** What it resolves to — shown when the two differ, so a dropped character is visible. */
  vendorPrefix: string;
  quantity: number;
  consumer: string;
  scopeInput: string;
  ticket: string;
  issuedBy: string;
  onEnvironmentChange: (value: ApiKeyEnvironment) => void;
  onFormatChange: (value: ApiKeyFormat) => void;
  onVendorPrefixChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onConsumerChange: (value: string) => void;
  onScopeInputChange: (value: string) => void;
  onTicketChange: (value: string) => void;
  onIssuedByChange: (value: string) => void;
  onGenerate: () => void;
}

const fieldLabel = 'text-xs font-bold uppercase tracking-wider text-muted-foreground';

const ApiKeyOptionsPanel: React.FC<ApiKeyOptionsPanelProps> = ({
  environment,
  format,
  vendorPrefixInput,
  vendorPrefix,
  quantity,
  consumer,
  scopeInput,
  ticket,
  issuedBy,
  onEnvironmentChange,
  onFormatChange,
  onVendorPrefixChange,
  onQuantityChange,
  onConsumerChange,
  onScopeInputChange,
  onTicketChange,
  onIssuedByChange,
  onGenerate,
}) => {
  const formatOptions = buildFormatOptions(vendorPrefix);

  return (
    <ToolLayout.Panel
      title="Issue"
      actions={
        <Button variant="default" size="sm" onClick={onGenerate}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className={fieldLabel} htmlFor="api-key-vendor-prefix">
            Namespace
          </label>
          <Input
            id="api-key-vendor-prefix"
            value={vendorPrefixInput}
            onChange={(event) => onVendorPrefixChange(event.target.value)}
            maxLength={API_KEY_VENDOR_PREFIX_MAX_LENGTH}
            placeholder={DEFAULT_API_KEY_VENDOR_PREFIX}
            spellCheck={false}
            className="font-mono"
            aria-describedby="api-key-vendor-prefix-hint"
          />
          <p id="api-key-vendor-prefix-hint" className="text-xs text-muted-foreground">
            {vendorPrefixInput.trim() === vendorPrefix ? (
              <>
                Leads every key and drives the scan pattern. Lower-case letters, digits and hyphens.
              </>
            ) : (
              <>
                Issued as <span className="font-mono text-foreground">{vendorPrefix}_</span> — only
                lower-case letters, digits and hyphens survive.
              </>
            )}
          </p>
        </div>

        <div className="space-y-2">
          <span className={fieldLabel}>Environment</span>
          <div className="grid grid-cols-4 gap-2">
            {ENVIRONMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onEnvironmentChange(option.value)}
                aria-pressed={environment === option.value}
                className={cn(
                  'rounded-lg border px-2 py-1.5 font-mono text-xs transition-colors',
                  environment === option.value
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/70 bg-muted/30 text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className={fieldLabel}>Format</span>
          <div className="space-y-2">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFormatChange(option.value)}
                aria-pressed={format === option.value}
                className={cn(
                  'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                  format === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border/70 bg-muted/30 hover:bg-muted/50',
                )}
              >
                <span className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      format === option.value ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {option.shape}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{option.summary}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={fieldLabel} htmlFor="api-key-quantity">
            Keys
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="api-key-quantity"
              type="number"
              min={API_KEY_QUANTITY_BOUNDS.min}
              max={API_KEY_QUANTITY_BOUNDS.max}
              value={quantity}
              onChange={(event) => onQuantityChange(Number(event.target.value))}
              className="w-24 font-mono"
            />
            {QUANTITY_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={quantity === preset ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onQuantityChange(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Two at once is the shape of a rotation: hand over the new key before revoking the old.
          </p>
        </div>

        <div className="space-y-2">
          <label className={fieldLabel} htmlFor="api-key-consumer">
            Consumer
          </label>
          <Input
            id="api-key-consumer"
            value={consumer}
            onChange={(event) => onConsumerChange(event.target.value)}
            placeholder="orders-api"
            className="font-mono"
          />
        </div>

        {format === 'prefixed' && (
          <div className="space-y-2">
            <label className={fieldLabel} htmlFor="api-key-scopes">
              Scopes
            </label>
            <Input
              id="api-key-scopes"
              value={scopeInput}
              onChange={(event) => onScopeInputChange(event.target.value)}
              placeholder="sms:send, email:send"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Empty means no rights at all — routes declare what they need, and anything undeclared
              stays shut.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className={fieldLabel} htmlFor="api-key-ticket">
              Ticket
            </label>
            <Input
              id="api-key-ticket"
              value={ticket}
              onChange={(event) => onTicketChange(event.target.value)}
              placeholder="PROJ-123"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className={fieldLabel} htmlFor="api-key-issued-by">
              Issued by
            </label>
            <Input
              id="api-key-issued-by"
              value={issuedBy}
              onChange={(event) => onIssuedByChange(event.target.value)}
              placeholder="your name"
            />
          </div>
        </div>
      </div>
    </ToolLayout.Panel>
  );
};

export default ApiKeyOptionsPanel;
