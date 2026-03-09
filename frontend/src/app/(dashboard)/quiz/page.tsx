'use client';
import { useState, useEffect } from 'react';
import { Zap, Trophy, RotateCcw, BookOpen, ChevronRight } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import QuizCard from '@/components/quiz/QuizCard';
import QuizResult from '@/components/quiz/QuizResult';
import { api } from '@/lib/api';
import { QuizQuestion, Topic } from '@/types';

type QuizState = 'select' | 'playing' | 'result';

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('select');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/topics');
        setTopics(res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const startQuiz = async (topic: Topic) => {
    try {
      setLoadingQuiz(true);
      setSelectedTopic(topic);
      const res = await api.get(`/quiz/generate?topicId=${topic.id}&count=10`);
      const qs: QuizQuestion[] = res.data.data || [];
      if (qs.length === 0) throw new Error('Tidak ada soal tersedia');
      setQuestions(qs);
      setCurrentIndex(0);
      setScore(0);
      setStartTime(Date.now());
      setState('playing');
    } catch (e: any) {
      alert(e.message || 'Gagal memuat soal quiz');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);
    if (currentIndex + 1 >= questions.length) {
      setTimeTaken(Math.round((Date.now() - startTime) / 1000));
      setState('result');
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleRetry = () => {
    if (selectedTopic) startQuiz(selectedTopic);
  };

  const handleBack = () => {
    setState('select');
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
  };

  if (state === 'playing' && questions.length > 0) {
    return (
      <PageWrapper title={`Quiz: ${selectedTopic?.title}`} description={`Soal ${currentIndex + 1} dari ${questions.length}`}>
        <div className="max-w-2xl mx-auto">
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
          <QuizCard
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            total={questions.length}
            onAnswer={handleAnswer}
          />
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground">
              Keluar Quiz
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (state === 'result') {
    return (
      <PageWrapper title="Hasil Quiz" description="">
        <div className="max-w-md mx-auto space-y-4">
          <QuizResult
            score={score}
            total={questions.length}
            timeTaken={timeTaken}
            onRetry={handleRetry}
          />
          <Button variant="outline" onClick={handleBack} className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />Pilih Topik Lain
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Quiz" description="Uji pemahamanmu dengan soal-soal latihan">
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Belum ada topik</p>
          <p className="text-sm">Tambahkan topik terlebih dahulu untuk memulai quiz</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(topic => (
            <Card key={topic.id} className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => !loadingQuiz && startQuiz(topic)}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color || '#6366f1' }} />
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {topic.category && <Badge variant="secondary" className="text-xs mb-3">{topic.category}</Badge>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{topic._count?.quizzes ?? 0} kuis sebelumnya</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground"
                    disabled={loadingQuiz}>
                    Mulai <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
