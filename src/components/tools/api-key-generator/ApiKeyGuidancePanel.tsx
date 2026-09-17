import React from 'react';
import { Check } from 'lucide-react';
import { ToolLayout } from '../../ui/ToolLayout';
import { API_KEY_GUIDANCE } from './constants';

const ApiKeyGuidancePanel: React.FC = () => (
  <ToolLayout.Panel title="Before you hand it over">
    <ul className="space-y-2.5">
      {API_KEY_GUIDANCE.map((line) => (
        <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  </ToolLayout.Panel>
);

export default ApiKeyGuidancePanel;
