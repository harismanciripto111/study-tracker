'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Clock, BookOpen, Calendar } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProgressChart from '@/components/progress/ProgressChart';
import ProgressBar from '@/components/progress/ProgressBar';
import { api } from '@/lib/api';

interface SessionSummary {
  id: string;
  topicTitle: string;
  topicColor?: string;
  duration: number;
  date: string;
  mood?: string;
}

interface ProgressStats {
  totalMinutes: number;
  totalSessions: number;
  avgPerDay: number;
  streak: number;
  byTopic: { topicId: string; title: string; color?: string; minutes: number }[];
  daily: { date: string; minutes: number }[];
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          api.get('/progress/stats'),
          api.get('/sessions?limit=20&sort=date:desc'),
        ]);
        setStats(statsRes.data.data);
        setSessions(sessionsRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  };

  const maxTopicMinutes = stats?.byTopic[0]?.minutes || 1;

  return (
    <PageWrapper title="Progress Belajar" description="Pantau perkembangan belajarmu dari waktu ke waktu">
      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Clock className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Belajar</p>
                    <p className="text-2xl font-bold">{formatDuration(stats?.totalMinutes || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950"><BookOpen className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Sesi</p>
                    <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950"><TrendingUp className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rata-rata/Hari</p>
                    <p className="text-2xl font-bold">{formatDuration(stats?.avgPerDay || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950"><Calendar className="h-5 w-5 text-orange-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{stats?.streak || 0} hari</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {stats?.daily && stats.daily.length > 0 && (
            <ProgressChart data={stats.daily} title="Aktivitas Belajar 30 Hari Terakhir" />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Topic */}
            <Card>
              <CardHeader><CardTitle className="text-base">Waktu per Topik</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats?.byTopic && stats.byTopic.length > 0 ? stats.byTopic.map(t => (
                  <div key={t.topicId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#6366f1' }} />
                        <span>{t.title}</span>
                      </div>
                      <span className="text-muted-foreground">{formatDuration(t.minutes)}</span>
                    </div>
                    <ProgressBar value={t.minutes} max={maxTopicMinutes} size="sm" color={t.color} />
                  </div>
                )) : <p className="text-sm text-muted-foreground">Belum ada data</p>}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader><CardTitle className="text-base">Sesi Terakhir</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {sessions.length > 0 ? sessions.slice(0, 8).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.topicColor || '#6366f1' }} />
                      <span className="font-medium">{s.topicTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{formatDuration(s.duration)}</span>
                      <span>{new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Belum ada sesi</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
