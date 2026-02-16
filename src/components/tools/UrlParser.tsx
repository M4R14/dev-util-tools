import React from 'react';
import ToolLayout from '../ui/ToolLayout';
import { useUrlParser } from '../../hooks/useUrlParser';
import { toast } from 'sonner';
import UrlInputSection from './url-parser/UrlInputSection';
import UrlComponents from './url-parser/UrlComponents';
import UrlQueryParams from './url-parser/UrlQueryParams';

const UrlParser: React.FC = () => {
  const { input, setInput, parsedUrl, error, params, getEncoded, decodeUrl, updateParam } =
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

  return (
    <ToolLayout>
      <div className="space-y-8">
        <UrlInputSection
          input={input}
          error={error}
          onInputChange={setInput}
          onEncode={handleEncode}
          onDecode={handleDecode}
          onClear={clearInput}
        />

        {error === null && parsedUrl && (
          <div className="grid gap-6 md:grid-cols-2 lg:h-[600px]">
            <UrlComponents parsedUrl={parsedUrl} />
            <UrlQueryParams params={params} onParamChange={updateParam} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default UrlParser;
