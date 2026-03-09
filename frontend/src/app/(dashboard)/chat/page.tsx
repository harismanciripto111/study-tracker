'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Kamu adalah asisten belajar AI yang membantu siswa Indonesia belajar lebih efektif. 
Kamu bisa membantu menjelaskan konsep, membuat rangkuman, membuat soal latihan, dan memberikan tips belajar.
Jawab dalam Bahasa Indonesia kecuali diminta menggunakan bahasa lain. Gunakan format yang mudah dipahami.`;

const QUICK_PROMPTS = [
  'Buatkan soal latihan matematika',
  'Jelaskan konsep fotosintesis',
  'Tips belajar yang efektif',
  'Rangkum materi fisika dasar',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContents = (msgs: Message[]) =>
    msgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY tidak dikonfigurasi');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: buildContents(updatedMessages),
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gagal mendapatkan respons dari AI');
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak ada respons.';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: replyText,
        timestamp: new Date(),
      }]);
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <PageWrapper title="AI Study Assistant" description="Tanya apa saja tentang materi pelajaranmu">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Asisten Belajar AI</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Tanya tentang materi pelajaran, minta buatkan soal, atau dapatkan tips belajar.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map(p => (
                  <Button key={p} variant="outline" size="sm" onClick={() => sendMessage(p)}
                    className="text-xs">{p}</Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                )}>
                  <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                  <p className={cn('text-xs mt-1 opacity-60',
                    msg.role === 'user' ? 'text-right' : '')}>
                    {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-center">
              <Badge variant="destructive" className="text-xs">{error}</Badge>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t pt-4">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {QUICK_PROMPTS.map(p => (
                <Button key={p} variant="ghost" size="sm" onClick={() => sendMessage(p)}
                  className="text-xs h-7 px-2 text-muted-foreground">{p}</Button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setMessages([])}
                className="text-xs h-7 px-2 text-destructive ml-auto">
                <Trash2 className="h-3 w-3 mr-1" />Hapus Chat
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis pertanyaan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
              rows={2}
              className="resize-none flex-1"
              disabled={loading}
            />
            <Button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} size="icon" className="h-full">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
