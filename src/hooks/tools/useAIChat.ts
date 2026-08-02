import { useState, useEffect, useRef, useCallback } from 'react';
import { askGemini } from '../../services/gemini';
import { toast } from 'sonner';
import { useGeminiApiKey } from '../useGeminiApiKey';

const API_KEY_MISSING_ERROR = 'Please configure your Gemini API Key in settings.';
const DEFAULT_SERVICE_ERROR = 'Failed to communicate with AI service';
const EMPTY_RESPONSE_TEXT = 'No response returned.';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

const createMessage = (role: Message['role'], content: string): Message => {
  const timestamp = Date.now();
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    role,
    content,
    timestamp,
  };
};

const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : DEFAULT_SERVICE_ERROR;

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { apiKey, saveApiKey } = useGeminiApiKey();
  const [tempKey, setTempKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const openSettings = useCallback(() => {
    setTempKey(apiKey);
    setShowSettings(true);
  }, [apiKey]);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleSaveSettings = useCallback(() => {
    saveApiKey(tempKey);
    setShowSettings(false);
    toast.success('API configuration saved successfully');
  }, [saveApiKey, tempKey]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    toast.info('Conversation cleared');
  }, []);

  const handleAsk = useCallback(async () => {
    const promptToSend = prompt;
    if (!promptToSend.trim()) return;

    appendMessage(createMessage('user', promptToSend));
    setPrompt('');
    setLoading(true);
    setError(null);
    setIsContextOpen(false);

    try {
      if (!apiKey) throw new Error(API_KEY_MISSING_ERROR);

      const result = await askGemini(promptToSend, codeContext, apiKey);

      appendMessage(createMessage('ai', typeof result === 'string' ? result : EMPTY_RESPONSE_TEXT));
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [prompt, appendMessage, apiKey, codeContext]);

  return {
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
  };
};
