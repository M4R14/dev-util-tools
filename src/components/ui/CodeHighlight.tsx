import React, { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import { cn } from '../../lib/utils';

// Register only the languages we need
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

interface CodeHighlightProps {
  code: string;
  language: 'json' | 'xml' | 'javascript' | 'bash' | 'plaintext';
  className?: string;
}

/**
 * Highlighting is computed, not applied to the DOM afterwards.
 *
 * This used to call `hljs.highlightElement` from an effect, which rewrites the innerHTML of a node
 * React owns. On each re-highlight hljs then found its own previous `<span>`s sitting there and
 * warned "the element with unescaped HTML" — dozens of them from a handful of preview toggles —
 * while React and hljs took turns writing the same node.
 *
 * `hljs.highlight` returns HTML with the source already escaped, so it is safe to set directly and
 * there is only one writer. Text that cannot be highlighted goes through React as a text child,
 * which escapes it, so no branch here does its own escaping.
 */
export const CodeHighlight: React.FC<CodeHighlightProps> = ({ code, language, className }) => {
  const html = useMemo(() => {
    if (!code || language === 'plaintext' || !hljs.getLanguage(language)) return null;

    try {
      // ignoreIllegals: a half-typed document is not an error, it is someone mid-paste.
      return hljs.highlight(code, { language, ignoreIllegals: true }).value;
    } catch {
      return null;
    }
  }, [code, language]);

  return (
    <pre
      className={cn(
        'w-full h-full overflow-auto m-0 p-0 bg-transparent font-mono text-sm leading-relaxed',
        className,
      )}
    >
      {html === null ? (
        <code className="hljs !bg-transparent !p-0">{code}</code>
      ) : (
        <code
          className={`language-${language} hljs !bg-transparent !p-0`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </pre>
  );
};
