import React from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Card } from '../ui/Card';
import { useAIChat } from '../../hooks/useAIChat';
import SettingsModal from './ai/SettingsModal';
import AssistantHeader from './ai/AssistantHeader';
import ChatPanel from './ai/ChatPanel';
import Composer from './ai/Composer';

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

      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto">
        <AssistantHeader onClearChat={handleClearChat} onOpenSettings={openSettings} />

        <Card className="flex-1 overflow-hidden flex flex-col relative shadow-inner bg-muted/5 border-border">
          <ChatPanel
            messages={messages}
            loading={loading}
            error={error}
            hasApiKey={Boolean(apiKey)}
            onOpenSettings={openSettings}
            messagesEndRef={messagesEndRef}
          />
          <Composer
            isContextOpen={isContextOpen}
            codeContext={codeContext}
            prompt={prompt}
            loading={loading}
            hasApiKey={Boolean(apiKey)}
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
