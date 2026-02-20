import React from 'react';
import { ArrowRightLeft, Braces, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { Switch } from '../ui/Switch';
import { Textarea } from '../ui/Textarea';
import { CodeHighlight } from '../ui/CodeHighlight';
import { useXmlToJson } from '../../hooks/useXmlToJson';

const XMLToJson: React.FC = () => {
  const {
    xmlInput,
    setXmlInput,
    jsonOutput,
    error,
    includeAttributes,
    setIncludeAttributes,
    convert,
    clear,
  } = useXmlToJson();

  const handleConvert = () => {
    if (convert()) {
      toast.success('Converted XML to JSON');
      return;
    }

    if (xmlInput.trim()) {
      toast.error('Unable to convert XML');
    } else {
      toast.info('Please enter XML first');
    }
  };

  const handleClear = () => {
    clear();
    toast.info('Cleared');
  };

  return (
    <ToolLayout className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ToolLayout.Panel
          title="XML Input"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleConvert} className="gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Convert
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClear} title="Clear">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Include attributes</p>
                <p className="text-xs text-muted-foreground">
                  Keep XML attributes under <span className="font-mono">@attributes</span>
                </p>
              </div>
              <Switch
                id="xml-to-json-attributes"
                checked={includeAttributes}
                onCheckedChange={setIncludeAttributes}
                aria-label="Include XML attributes in output"
              />
            </div>

            <Textarea
              value={xmlInput}
              onChange={(event) => setXmlInput(event.target.value)}
              placeholder="Paste your XML here..."
              className="min-h-[460px] font-mono text-sm resize-y"
              aria-label="XML input"
            />

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title="JSON Output"
          actions={
            <div className="flex items-center gap-2">
              <CopyButton value={jsonOutput} disabled={!jsonOutput} className="h-8 w-8" />
            </div>
          }
        >
          {jsonOutput ? (
            <div className="h-[520px] overflow-auto">
              <CodeHighlight code={jsonOutput} language="json" />
            </div>
          ) : (
            <div className="h-[520px] flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
              <div className="mb-3 rounded-full border border-border bg-background p-3">
                <Braces className="h-7 w-7 text-primary/70" />
              </div>
              <p className="font-medium text-foreground">Converted JSON will appear here</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paste XML on the left, then click <span className="font-medium">Convert</span>
              </p>
            </div>
          )}
        </ToolLayout.Panel>
      </div>
    </ToolLayout>
  );
};

export default XMLToJson;
