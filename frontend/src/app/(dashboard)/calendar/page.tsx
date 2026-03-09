'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface DaySession {
  id: string;
  topicTitle: string;
  topicColor?: string;
  duration: number;
  startTime?: string;
}

interface CalendarDay {
  date: string;
  sessions: DaySession[];
  totalMinutes: number;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sessions/calendar?year=${year}&month=${month + 1}`);
        setCalendarData(res.data.data || {});
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return '';
    if (minutes < 30) return 'bg-primary/20';
    if (minutes < 60) return 'bg-primary/40';
    if (minutes < 120) return 'bg-primary/70';
    return 'bg-primary';
  };

  const selectedSessions = selectedDay ? calendarData[selectedDay]?.sessions || [] : [];
  const selectedTotal = selectedDay ? calendarData[selectedDay]?.totalMinutes || 0 : 0;

  return (
    <PageWrapper title="Kalender Belajar" description="Lihat aktivitas belajarmu setiap hari">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">{monthName}</CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8"
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8"
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              {loading ? (
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(35)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                  {days.map(day => {
                    const key = formatDateKey(day);
                    const dayData = calendarData[key];
                    const minutes = dayData?.totalMinutes || 0;
                    const isToday = key === new Date().toISOString().split('T')[0];
                    const isSelected = selectedDay === key;
                    return (
                      <button key={day} onClick={() => setSelectedDay(isSelected ? null : key)}
                        className={cn(
                          'relative h-10 rounded-lg text-sm font-medium transition-all hover:ring-2 hover:ring-primary/50',
                          isToday && 'ring-2 ring-primary',
                          isSelected && 'ring-2 ring-primary bg-primary/10',
                          minutes > 0 && !isSelected && getIntensity(minutes),
                          minutes > 0 && 'text-primary-foreground'
                        )}>
                        {day}
                        {minutes > 0 && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-70" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDay
                  ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Pilih Tanggal'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDay ? (
                <p className="text-sm text-muted-foreground">Klik tanggal pada kalender untuk melihat sesi belajar.</p>
              ) : selectedSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada sesi belajar pada hari ini.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Total: {Math.floor(selectedTotal/60)}j {selectedTotal%60}m</p>
                  {selectedSessions.map(s => (
                    <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.topicColor || '#6366f1' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.topicTitle}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{s.duration} menit</span>
                          {s.startTime && <span>• {s.startTime}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
