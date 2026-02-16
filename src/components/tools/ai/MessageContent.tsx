import React from 'react';
import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)?\n?([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return <CodeBlock key={index} language={lang} code={code.trim()} />;
        }
        // Basic paragraph handling
        return part.split('\n\n').map(
          (p, i) =>
            p.trim() && (
              <p
                key={`${index}-${i}`}
                className="whitespace-pre-wrap leading-relaxed text-foreground/90"
              >
                {p}
              </p>
            ),
        );
      })}
    </div>
  );
};

export default MessageContent;
