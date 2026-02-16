import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import { cn } from '../../lib/utils';

// Register only the languages we need
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

interface CodeHighlightProps {
  code: string;
  language: 'json' | 'xml';
  className?: string;
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({ code, language, className }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && code) {
      codeRef.current.removeAttribute('data-highlighted');
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre
      className={cn(
        'w-full h-full overflow-auto m-0 p-0 bg-transparent font-mono text-sm leading-relaxed',
        className,
      )}
    >
      <code ref={codeRef} className={`language-${language} !bg-transparent !p-0`}>
        {code}
      </code>
    </pre>
  );
};
