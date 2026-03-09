'use client';

import { useEffect, useState, useCallback } from 'react';
import { progressApi, topicsApi } from '@/lib/api';
import { ProgressLog, ProgressSummary, Topic } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PageWrapper from '@/components/layout/PageWrapper';
import ProgressBar from '@/components/progress/ProgressBar';
import ProgressChart from '@/components/progress/ProgressChart';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Calendar, TrendingUp } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  minutes: number;
}

export default function ProgressPage() {
  useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<ProgressSummary[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [progressRes, topicsRes] = await Promise.all([
        progressApi.list(),
        topicsApi.list(),
      ]);

      const logs: ProgressLog[] = progressRes.data?.data ?? [];
      const topics: Topic[] = topicsRes.data?.data ?? [];

      const total = logs.reduce((sum, l) => sum + (l.duration ?? 0), 0);
      setTotalMinutes(total);
      setTotalSessions(logs.length);

      const byTopic: Record<string, { totalMinutes: number; sessionCount: number; lastStudied?: string }> = {};
      for (const log of logs) {
        if (!byTopic[log.topicId]) byTopic[log.topicId] = { totalMinutes: 0, sessionCount: 0 };
        byTopic[log.topicId].totalMinutes += log.duration ?? 0;
        byTopic[log.topicId].sessionCount += 1;
        const d = log.studiedAt ?? log.createdAt ?? '';
        if (!byTopic[log.topicId].lastStudied || d > byTopic[log.topicId].lastStudied!) {
          byTopic[log.topicId].lastStudied = d;
        }
      }

      const sums: ProgressSummary[] = topics.map((t) => ({
        topicId: t.id,
        topicTitle: t.title,
        totalMinutes: byTopic[t.id]?.totalMinutes ?? 0,
        sessionCount: byTopic[t.id]?.sessionCount ?? 0,
        lastStudied: byTopic[t.id]?.lastStudied,
      })).sort((a, b) => b.totalMinutes - a.totalMinutes);

      setSummaries(sums);

      const now = new Date();
      const days: ChartDataPoint[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const minutes = logs
          .filter((l) => (l.studiedAt ?? '').startsWith(key))
          .reduce((sum, l) => sum + (l.duration ?? 0), 0);
        days.push({ date: key.slice(5), minutes });
      }
      setChartData(days);
    } catch {
      toast({ title: 'Gagal memuat progress', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxMinutes = summaries.length > 0 ? Math.max(...summaries.map((s) => s.totalMinutes), 1) : 1;

  return (
    <PageWrapper
      title="Progress Belajar"
      description="Pantau kemajuan belajarmu dari waktu ke waktu"
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 pt-5">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m</p>
                  <p className="text-xs text-gray-500">Total Waktu Belajar</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-5">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                  <p className="text-xs text-gray-500">Total Sesi Belajar</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-5">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaries.filter((s) => s.totalMinutes > 0).length}</p>
                  <p className="text-xs text-gray-500">Topik Dipelajari</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold">Aktivitas 14 Hari Terakhir</h2>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Progress per Topik</h2>
            </CardHeader>
            <CardContent className="space-y-5">
              {summaries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada data progress.</p>
              ) : (
                summaries.map((s) => (
                  <div key={s.topicId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{s.topicTitle}</span>
                      <span className="text-gray-400 text-xs">
                        {Math.floor(s.totalMinutes / 60)}j {s.totalMinutes % 60}m &bull; {s.sessionCount} sesi
                      </span>
                    </div>
                    <ProgressBar value={(s.totalMinutes / maxMinutes) * 100} showLabel={false} size="md" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
