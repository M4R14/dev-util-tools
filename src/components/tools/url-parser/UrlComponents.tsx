import React from 'react';
import {
  Globe,
  Hash as HashIcon,
  Link,
  Lock,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Input } from '../../ui/Input';
import UrlComponentInput from './UrlComponentInput';

interface UrlComponentsProps {
  parsedUrl: URL;
}

const UrlComponents: React.FC<UrlComponentsProps> = ({ parsedUrl }) => {
  const isSecure = parsedUrl.protocol === 'https:';
  const effectivePort = parsedUrl.port || (isSecure ? '443' : '80');

  return (
    <ToolLayout.Panel
      title="Parsed Components"
      className="bg-card/50"
      actions={
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${
            isSecure
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isSecure ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          {isSecure ? 'Secure (HTTPS)' : 'Not secure (HTTP)'}
        </span>
      }
    >
      <div className="space-y-6 pt-1 h-full overflow-y-auto pr-1">
        <UrlComponentInput
          label="Canonical URL"
          value={parsedUrl.toString()}
          icon={<Link className="w-3 h-3" />}
          multiline
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Protocol
            </label>
            <Input
              readOnly
              value={parsedUrl.protocol}
              className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Port
            </label>
            <Input
              readOnly
              value={effectivePort}
              className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20"
            />
          </div>
        </div>

        <UrlComponentInput
          label="Host"
          value={parsedUrl.hostname}
          icon={<Globe className="w-3 h-3" />}
        />
        <UrlComponentInput
          label="Origin"
          value={parsedUrl.origin}
          icon={<Link className="w-3 h-3" />}
        />
        <UrlComponentInput
          label="Path"
          value={parsedUrl.pathname}
          icon={<MapPin className="w-3 h-3" />}
          multiline
        />

        {parsedUrl.search && (
          <UrlComponentInput
            label="Query String"
            value={parsedUrl.search}
            icon={<FileText className="w-3 h-3" />}
            multiline
          />
        )}

        {parsedUrl.hash && (
          <UrlComponentInput
            label="Hash"
            value={parsedUrl.hash}
            icon={<HashIcon className="w-3 h-3" />}
          />
        )}
      </div>
    </ToolLayout.Panel>
  );
};

export default UrlComponents;
