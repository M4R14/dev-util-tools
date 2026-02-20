import React from 'react';
import { BookOpenText, ShieldAlert, ShieldCheck } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Card } from '../ui/Card';
import { useAIChat } from '../../hooks/useAIChat';
import { AssistantHeader, ChatPanel, Composer, SettingsModal } from './ai';

const AIAssistant: React.FC = () => {
  const {
    messages,
    prompt,
    setPrompt,
    codeContext,
    setCodeContext,
    isContextOpen,
    setIsContextOpen,
    loading,
    error,
    messagesEndRef,
    apiKey,
    tempKey,
    setTempKey,
    showSettings,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleClearChat,
    handleAsk,
  } = useAIChat();

  const hasApiKey = Boolean(apiKey);
  const activeContextLines = codeContext.trim() ? codeContext.trim().split('\n').length : 0;

  return (
    <ToolLayout>
      {showSettings && (
        <SettingsModal
          tempKey={tempKey}
          onTempKeyChange={setTempKey}
          onSave={handleSaveSettings}
          onClose={closeSettings}
        />
      )}

      <div className="flex flex-col h-[calc(100vh-11rem)] min-h-[520px] max-w-5xl mx-auto">
        <AssistantHeader
          onClearChat={handleClearChat}
          onOpenSettings={openSettings}
          hasApiKey={hasApiKey}
          messageCount={messages.length}
          loading={loading}
        />

        <div className="mb-3 rounded-xl border border-border bg-card/60 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm">
            {hasApiKey ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-500" aria-hidden="true" />
            )}
            <span className="font-medium text-foreground">
              {hasApiKey ? 'Gemini API configured' : 'Gemini API key not configured'}
            </span>
          </div>
          <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpenText className="w-3.5 h-3.5" aria-hidden="true" />
              {messages.length} messages
            </span>
            <span>{activeContextLines} context lines</span>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col relative shadow-inner bg-muted/5 border-border">
          <ChatPanel
            messages={messages}
            loading={loading}
            error={error}
            hasApiKey={hasApiKey}
            onOpenSettings={openSettings}
            onUsePrompt={setPrompt}
            messagesEndRef={messagesEndRef}
          />
          <Composer
            isContextOpen={isContextOpen}
            codeContext={codeContext}
            prompt={prompt}
            loading={loading}
            hasApiKey={hasApiKey}
            onToggleContext={() => setIsContextOpen(!isContextOpen)}
            onCodeContextChange={setCodeContext}
            onPromptChange={setPrompt}
            onAsk={handleAsk}
          />
        </Card>
      </div>
    </ToolLayout>
  );
};

export default AIAssistant;
