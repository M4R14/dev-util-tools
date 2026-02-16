import { useState, useEffect, useRef, useCallback } from 'react';
import { askGemini } from '../services/gemini';
import { encrypt, decrypt } from '../lib/crypto';
import { toast } from 'sonner';

const STORAGE_KEY = 'devpulse_secure_config';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? decrypt(saved) : '';
  });
  const [tempKey, setTempKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const openSettings = useCallback(() => {
    setTempKey(apiKey);
    setShowSettings(true);
  }, [apiKey]);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleSaveSettings = useCallback(() => {
    setApiKey(tempKey);
    localStorage.setItem(STORAGE_KEY, encrypt(tempKey));
    setShowSettings(false);
    toast.success('API configuration saved successfully');
  }, [tempKey]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    toast.info('Conversation cleared');
  }, []);

  const handleAsk = useCallback(async () => {
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);
    setError(null);
    setIsContextOpen(false);

    try {
      if (!apiKey) throw new Error('Please configure your Gemini API Key in settings.');

      const result = await askGemini(userMsg.content, codeContext, apiKey);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: typeof result === 'string' ? result : 'No response returned.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to communicate with AI service';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [prompt, apiKey, codeContext]);

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
