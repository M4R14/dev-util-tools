import React from 'react';
import { Lock, Globe, Link, MapPin, Hash as HashIcon, FileText } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Input } from '../../ui/Input';
import UrlComponentInput from './UrlComponentInput';

interface UrlComponentsProps {
  parsedUrl: URL;
}

const UrlComponents: React.FC<UrlComponentsProps> = ({ parsedUrl }) => (
  <ToolLayout.Panel title="Components" className="bg-card/50">
    <div className="space-y-6 pt-2 h-full overflow-y-auto pr-2">
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Protocol
            </label>
            <div className="relative group">
              <Input
                readOnly
                value={parsedUrl.protocol}
                className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20"
              />
              <div className="absolute right-2.5 top-2.5">
                {parsedUrl.protocol === 'https:' ? (
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Port
            </label>
            <Input
              readOnly
              value={parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80')}
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

        {parsedUrl.hash && (
          <UrlComponentInput
            label="Hash"
            value={parsedUrl.hash}
            icon={<HashIcon className="w-3 h-3" />}
          />
        )}

        {parsedUrl.search && (
          <UrlComponentInput
            label="Query String"
            value={parsedUrl.search}
            icon={<FileText className="w-3 h-3" />}
            multiline
          />
        )}
      </div>
    </div>
  </ToolLayout.Panel>
);

export default UrlComponents;
