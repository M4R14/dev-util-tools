import React, { useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { CodeHighlight } from './CodeHighlight';
import { CodeInput } from './CodeInput';
import { Button } from './Button';
import { cn } from '../../lib/utils';

type CodeLanguage = 'json' | 'xml' | 'javascript' | 'bash' | 'plaintext';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeLanguage;
  placeholder?: string;
  /** Height of the editing area. It stays draggable in edit mode. */
  initialHeightClassName?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * A pasted document that can be read as highlighted code or edited as plain text.
 *
 * A `<textarea>` renders plain text and nothing else, so highlighting while typing needs either a
 * transparent overlay kept in sync with a `<pre>` behind it, or a full editor dependency. The
 * overlay drifts — line heights, scroll position, selection colour — and re-highlights on every
 * keystroke of documents this app routinely receives at three thousand lines.
 *
 * The JSON Formatter already answered this by toggling between the two, and this is that answer
 * extracted so three more tools do not each grow their own copy. Clicking the highlighted text
 * switches back to editing.
 *
 * The JSON Formatter itself keeps its own version on purpose: its toggle sits in the panel header
 * beside an indent selector and a clear button, and it carries an error overlay this does not.
 * Folding those in would mean options on this component that only one caller ever sets.
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  initialHeightClassName = 'h-40',
  className,
  'data-testid': testId,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  // Nothing to preview yet, so the toggle would only offer an empty pane.
  const canPreview = value.trim().length > 0;

  return (
    <div className={cn('relative', className)}>
      {canPreview && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing((previous) => !previous)}
          className="absolute right-0 top-0 z-10 h-7 w-7 text-muted-foreground hover:text-foreground"
          title={isEditing ? 'Preview highlighted' : 'Edit'}
          aria-label={isEditing ? 'Preview highlighted' : 'Edit'}
          aria-pressed={!isEditing}
        >
          {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        </Button>
      )}

      {isEditing ? (
        <CodeInput
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          initialHeightClassName={initialHeightClassName}
          data-testid={testId}
          className="pr-8"
        />
      ) : (
        <div
          className={cn('cursor-text overflow-auto pr-8', initialHeightClassName)}
          onClick={() => setIsEditing(true)}
          title="Click to edit"
        >
          <CodeHighlight code={value} language={language} />
        </div>
      )}
    </div>
  );
};
