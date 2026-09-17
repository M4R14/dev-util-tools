import React from 'react';
import { ToolLayout } from '../../ui/ToolLayout';
import { CopyButton } from '../../ui/CopyButton';
import { CodeHighlight } from '../../ui/CodeHighlight';

interface ApiKeyHandoffPanelProps {
  insertSql: string;
  envAssignment: string;
  scanPattern: string;
  /** The env line carries the keys themselves, so it follows the same reveal toggle. */
  revealed: boolean;
}

interface SnippetProps {
  title: string;
  note: string;
  code: string;
  language: 'bash' | 'plaintext';
  copyValue?: string;
  copyMessage: string;
}

const Snippet: React.FC<SnippetProps> = ({
  title,
  note,
  code,
  language,
  copyValue,
  copyMessage,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
      </div>
      <CopyButton value={copyValue ?? code} successMessage={copyMessage} />
    </div>
    <div className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-3">
      <CodeHighlight code={code} language={language} />
    </div>
  </div>
);

const ApiKeyHandoffPanel: React.FC<ApiKeyHandoffPanelProps> = ({
  insertSql,
  envAssignment,
  scanPattern,
  revealed,
}) => (
  <ToolLayout.Panel title="Handoff">
    <div className="space-y-6">
      <Snippet
        title="Register the key"
        note="Hashes only — run this against the database of that one environment."
        code={insertSql}
        language="plaintext"
        copyMessage="SQL copied"
      />

      <Snippet
        title="Or, for the env-var tier"
        note="Comma-separated pairs: several keys live at once, which is what makes a rotation safe."
        code={
          revealed
            ? envAssignment
            : 'CLIENT_API_KEYS=•••••  (reveal to read, copy works either way)'
        }
        language="bash"
        copyValue={envAssignment}
        copyMessage="Env line copied"
      />

      <Snippet
        title="Secret scanning"
        note="Add to gitleaks so a key pasted into a repository is caught at commit time."
        code={scanPattern}
        language="plaintext"
        copyMessage="Pattern copied"
      />
    </div>
  </ToolLayout.Panel>
);

export default ApiKeyHandoffPanel;
