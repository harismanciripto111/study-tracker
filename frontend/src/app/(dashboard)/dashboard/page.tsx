'use client';
import { useState, useEffect } from 'react';
import { Clock, BookOpen, Flame, Target, Plus } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import StatsCard from '@/components/dashboard/StatsCard';
import StreakWidget from '@/components/dashboard/StreakWidget';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import RecentSessions from '@/components/dashboard/RecentSessions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { progressApi, streakApi, topicsApi } from '@/lib/api';
import { formatDuration, minutesToHours, getErrorMessage } from '@/lib/utils';
import { StreakData, ProgressLog, Topic, WeeklyData } from '@/types';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

function buildWeeklyData(sessions: ProgressLog[]): WeeklyData[] {
  const days: WeeklyData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const key = format(date, 'yyyy-MM-dd');
    const label = format(date, 'EEE', { locale: id });
    const daySessions = sessions.filter((s) => s.studiedAt.startsWith(key));
    const minutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    days.push({ day: label, minutes, sessions: daySessions.length });
  }
  return days;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [sessions, setSessions] = useState<ProgressLog[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [error, setError] = useState('');

  const [logOpen, setLogOpen] = useState(false);
  const [logTopicId, setLogTopicId] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [streakRes, progressRes, topicsRes] = await Promise.all([
        streakApi.get(),
        progressApi.list(),
        topicsApi.list(),
      ]);
      const streakData = streakRes.data.data || streakRes.data;
      const progressData = progressRes.data.data || progressRes.data;
      const topicsData = topicsRes.data.data || topicsRes.data;
      setStreak(streakData);
      setSessions(Array.isArray(progressData) ? progressData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setWeeklyData(buildWeeklyData(Array.isArray(progressData) ? progressData : []));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogSession = async () => {
    if (!logTopicId || !logDuration) { setLogError('Isi topik dan durasi'); return; }
    setLogLoading(true);
    setLogError('');
    try {
      await progressApi.create({
        topicId: logTopicId,
        duration: parseInt(logDuration),
        note: logNote || undefined,
      });
      setLogOpen(false);
      setLogTopicId(''); setLogDuration(''); setLogNote('');
      fetchData();
    } catch (err) {
      setLogError(getErrorMessage(err));
    } finally {
      setLogLoading(false);
    }
  };

  const totalMinutes = sessions.reduce((s, p) => s + p.duration, 0);
  const todaySessions = sessions.filter((s) => s.studiedAt.startsWith(format(new Date(), 'yyyy-MM-dd')));
  const todayMinutes = todaySessions.reduce((s, p) => s + p.duration, 0);

  if (loading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Dashboard"
      description={`Selamat belajar! ${format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}`}
      actions={
        <Dialog open={logOpen} onOpenChange={setLogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Catat Sesi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Catat Sesi Belajar</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              {logError && <p className="text-sm text-destructive">{logError}</p>}
              <div className="space-y-2">
                <Label>Topik</Label>
                <Select value={logTopicId} onValueChange={setLogTopicId}>
                  <SelectTrigger><SelectValue placeholder="Pilih topik..." /></SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durasi (menit)</Label>
                <Input type="number" min={1} placeholder="mis. 30" value={logDuration} onChange={(e) => setLogDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Catatan (opsional)</Label>
                <Input placeholder="Apa yang dipelajari?" value={logNote} onChange={(e) => setLogNote(e.target.value)} />
              </div>
              <Button onClick={handleLogSession} disabled={logLoading} className="w-full">
                {logLoading ? 'Menyimpan...' : 'Simpan Sesi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Jam Belajar" value={`${minutesToHours(totalMinutes)}j`} subtitle={`${sessions.length} sesi total`} icon={Clock} iconColor="text-blue-500" />
        <StatsCard title="Hari Ini" value={`${formatDuration(todayMinutes)}`} subtitle={`${todaySessions.length} sesi hari ini`} icon={Target} iconColor="text-green-500" />
        <StatsCard title="Streak" value={`${streak?.currentStreak || 0} hari`} subtitle={`Terpanjang: ${streak?.longestStreak || 0} hari`} icon={Flame} iconColor="text-orange-500" />
        <StatsCard title="Topik Aktif" value={topics.length} subtitle="topik terdaftar" icon={BookOpen} iconColor="text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyData} />
        </div>
        {streak && <StreakWidget streak={streak} onCheckIn={setStreak} />}
      </div>

      <RecentSessions sessions={sessions} />
    </PageWrapper>
  );
}
