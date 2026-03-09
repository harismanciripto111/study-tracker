'use client';

import { useEffect, useRef, useState } from 'react';
import { chatApi } from '@/lib/api';
import { ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Halo! Saya asisten belajar AI kamu. Ada yang ingin kamu tanyakan atau diskusikan hari ini?',
  createdAt: new Date().toISOString(),
};

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatApi.send(text, history);
      const reply = res.data?.data?.message ?? res.data?.data ?? 'Maaf, tidak ada respons.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof reply === 'string' ? reply : JSON.stringify(reply),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast({ title: 'Gagal mengirim pesan', variant: 'destructive' });
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <PageWrapper
      title="AI Chat Assistant"
      description="Diskusikan materi belajarmu dengan asisten AI"
    >
      <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
        {/* Messages */}
        <Card className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-start gap-3 max-w-[85%]',
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white',
                  msg.role === 'user' ? 'bg-indigo-500' : 'bg-gray-700'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-gray-800">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </Card>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaanmu..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
