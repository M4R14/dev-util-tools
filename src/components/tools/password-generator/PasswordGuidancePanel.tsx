import React from 'react';
import ToolLayout from '../../ui/ToolLayout';
import { PASSWORD_GUIDANCE_LINES } from './constants';

const PasswordGuidancePanel: React.FC = () => (
  <ToolLayout.Panel title="Quick Guidance">
    <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-xs text-muted-foreground space-y-1.5">
      {PASSWORD_GUIDANCE_LINES.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  </ToolLayout.Panel>
);

export default PasswordGuidancePanel;
