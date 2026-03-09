'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizCardProps { question: QuizQuestion; questionNumber: number; total: number; onAnswer: (isCorrect: boolean, chosen: number) => void; }

export default function QuizCard({ question, questionNumber, total, onAnswer }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => { if (revealed) return; setSelected(idx); };
  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
    setTimeout(() => { onAnswer(selected === question.correctAnswer, selected); setSelected(null); setRevealed(false); }, 1200);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">Soal {questionNumber}/{total}</Badge>
          {question.difficulty && <Badge variant="secondary">{question.difficulty}</Badge>}
        </div>
        <CardTitle className="text-base leading-relaxed">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} disabled={revealed}
            className={cn('w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
              !revealed && selected === idx && 'border-primary bg-primary/10',
              !revealed && selected !== idx && 'border-border hover:border-primary/50 hover:bg-muted',
              revealed && idx === question.correctAnswer && 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300',
              revealed && selected === idx && idx !== question.correctAnswer && 'border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
              revealed && idx !== question.correctAnswer && selected !== idx && 'opacity-50 border-border'
            )}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
              <span>{opt}</span>
              {revealed && idx === question.correctAnswer && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
              {revealed && selected === idx && idx !== question.correctAnswer && <XCircle className="ml-auto h-4 w-4 text-red-500" />}
            </span>
          </button>
        ))}
        {revealed && question.explanation && (
          <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300"><strong>Penjelasan:</strong> {question.explanation}</p>
          </div>
        )}
        {!revealed && <Button onClick={handleSubmit} disabled={selected === null} className="w-full mt-2">Jawab</Button>}
      </CardContent>
    </Card>
  );
}
