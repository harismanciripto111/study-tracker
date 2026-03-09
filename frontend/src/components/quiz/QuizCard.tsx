'use client';

import { QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: number;
  showResult?: boolean;
  onAnswer: (index: number) => void;
}

const DIFFICULTY_COLOR = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showResult = false,
  onAnswer,
}: QuizCardProps) {
  const isAnswered = selectedAnswer !== undefined;

  const getOptionStyle = (index: number) => {
    if (!showResult || !isAnswered) {
      if (selectedAnswer === index) {
        return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300';
      }
      return 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50';
    }
    if (index === question.correctAnswer) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700';
    }
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700';
    }
    return 'border-gray-200 dark:border-gray-700 opacity-60';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Soal {questionNumber} / {totalQuestions}
          </span>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              DIFFICULTY_COLOR[question.difficulty]
            )}
          >
            {question.difficulty}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
          {question.question}
        </p>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isAnswered && onAnswer(index)}
              disabled={isAnswered}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-150 cursor-pointer',
                getOptionStyle(index),
                isAnswered && 'cursor-default'
              )}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-current flex items-center justify-center text-xs font-bold">
                {OPTION_LABELS[index]}
              </span>
              <span className="flex-1 text-sm">{option}</span>
              {showResult && isAnswered && index === question.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
              {showResult && isAnswered && selectedAnswer === index && index !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {showResult && isAnswered && question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Penjelasan:</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
