import React from 'react';
import { Link2 } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { CopyButton } from '../ui/CopyButton';
import { useUrlParser } from '../../hooks/useUrlParser';
import { toast } from 'sonner';
import { UrlComponents, UrlInputSection, UrlQueryParams } from './url-parser';

const UrlParser: React.FC = () => {
  const { input, setInput, parsedUrl, error, params, getEncoded, decodeUrl, updateParam, addParam, removeParam } =
    useUrlParser();

  const handleEncode = () => {
    const encoded = getEncoded();
    if (encoded) {
      navigator.clipboard.writeText(encoded);
      toast.success('URL encoded and copied to clipboard');
    } else {
      toast.error('Failed to encode URL');
    }
  };

  const handleDecode = () => {
    if (decodeUrl()) {
      toast.success('URL decoded');
    } else {
      toast.error('Failed to decode URL');
    }
  };

  const clearInput = () => {
    setInput('');
    toast.info('Cleared');
  };

  const status = !input.trim() ? 'idle' : parsedUrl && error === null ? 'valid' : 'invalid';
  const hasValidUrl = parsedUrl !== null && error === null;
  const canonicalUrl = hasValidUrl ? parsedUrl.toString() : '';

  return (
    <ToolLayout className="max-w-6xl mx-auto">
      <div className="space-y-6">
        <UrlInputSection
          input={input}
          error={error}
          status={status}
          parsedUrl={parsedUrl}
          paramCount={params.length}
          onInputChange={setInput}
          onEncode={handleEncode}
          onDecode={handleDecode}
          onClear={clearInput}
        />

        {hasValidUrl && parsedUrl && (
          <ToolLayout.Panel
            title="Normalized URL"
            actions={<CopyButton value={canonicalUrl} className="h-7 w-7" />}
          >
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                Canonical output
              </div>
              <p className="font-mono text-sm break-all text-foreground/90">{canonicalUrl}</p>
            </div>
          </ToolLayout.Panel>
        )}

        {hasValidUrl && parsedUrl && (
          <div className="grid gap-6 xl:grid-cols-2 xl:items-start xl:min-h-[560px]">
            <UrlComponents parsedUrl={parsedUrl} />
            <UrlQueryParams
              params={params}
              onParamChange={updateParam}
              onAddParam={addParam}
              onRemoveParam={removeParam}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default UrlParser;
