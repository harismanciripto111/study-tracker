'use client';

import { QuizResult as QuizResultType, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizResultProps {
  result: QuizResultType;
  questions: QuizQuestion[];
  onRetry: () => void;
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Luar Biasa!', color: 'text-green-600' };
  if (score >= 70) return { label: 'Bagus!', color: 'text-blue-600' };
  if (score >= 50) return { label: 'Cukup Baik', color: 'text-yellow-600' };
  return { label: 'Perlu Latihan', color: 'text-red-500' };
}

export default function QuizResult({ result, questions, onRetry }: QuizResultProps) {
  const { label, color } = getScoreLabel(result.score);

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-indigo-500" />
            </div>
          </div>
          <div className={cn('text-5xl font-bold mb-1', color)}>
            {result.score.toFixed(0)}%
          </div>
          <p className={cn('text-lg font-semibold mb-2', color)}>{label}</p>
          <p className="text-sm text-gray-500">
            {result.correct} jawaban benar dari {result.total} soal
          </p>

          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">{result.correct} Benar</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">{result.total - result.correct} Salah</span>
            </div>
          </div>

          <Button onClick={onRetry} className="mt-6" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Ulangi Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Review Jawaban</h3>
        {result.attempts.map((attempt, idx) => {
          const q = questions.find((qq) => qq.id === attempt.questionId);
          if (!q) return null;
          return (
            <Card
              key={attempt.questionId}
              className={cn(
                'border-l-4',
                attempt.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              )}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-2">
                  {attempt.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                      Jawabanmu:{' '}
                      <span
                        className={cn(
                          'font-medium',
                          attempt.isCorrect ? 'text-green-600' : 'text-red-500'
                        )}
                      >
                        {q.options[attempt.selectedAnswer]}
                      </span>
                    </p>
                    {!attempt.isCorrect && (
                      <p className="text-xs text-gray-500">
                        Jawaban benar:{' '}
                        <span className="font-medium text-green-600">
                          {q.options[q.correctAnswer]}
                        </span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-blue-500 mt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
