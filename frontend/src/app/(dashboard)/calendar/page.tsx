'use client';

import { useEffect, useState, useCallback } from 'react';
import { calendarApi } from '@/lib/api';
import { CalendarEvent } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function CalendarPage() {
  useAuth();
  const { toast } = useToast();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await calendarApi.get(year, month);
      setEvents(res.data?.data ?? []);
    } catch {
      toast({ title: 'Gagal memuat kalender', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [year, month, toast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventByDate = events.reduce<Record<string, CalendarEvent>>((acc, e) => {
    acc[e.date] = e;
    return acc;
  }, {});

  const toDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const todayStr = now.toISOString().split('T')[0];
  const selectedEvent = selectedDate ? eventByDate[selectedDate] : null;

  return (
    <PageWrapper
      title="Kalender Belajar"
      description="Lihat riwayat sesi belajarmu per tanggal"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-semibold">
                  {MONTH_NAMES[month - 1]} {year}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 rounded-lg" />
              ) : (
                <>
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, idx) => {
                      if (!day) return <div key={idx} />;
                      const dateStr = toDateStr(day);
                      const event = eventByDate[dateStr];
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedDate;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                          className={cn(
                            'relative flex flex-col items-center justify-start py-1.5 rounded-lg text-sm transition-all min-h-[52px]',
                            isSelected && 'bg-indigo-500 text-white',
                            !isSelected && isToday && 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 font-bold',
                            !isSelected && !isToday && 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
                          )}
                        >
                          <span className="font-medium">{day}</span>
                          {event && (
                            <span className={cn('mt-0.5 w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-indigo-500')} />
                          )}
                          {event && (
                            <span className={cn('text-[10px] leading-tight', isSelected ? 'text-indigo-100' : 'text-gray-400')}>
                              {event.sessionCount}s
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <h3 className="font-semibold">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Pilih tanggal'}
              </h3>
            </CardHeader>
            <CardContent>
              {!selectedDate && (
                <p className="text-sm text-gray-400">Klik tanggal pada kalender untuk melihat detail sesi.</p>
              )}
              {selectedDate && !selectedEvent && (
                <p className="text-sm text-gray-400">Tidak ada sesi pada tanggal ini.</p>
              )}
              {selectedEvent && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {Math.floor(selectedEvent.totalMinutes / 60)}j {selectedEvent.totalMinutes % 60}m
                      </p>
                      <p className="text-xs text-gray-400">Total waktu belajar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{selectedEvent.sessionCount}</p>
                      <p className="text-xs text-gray-400">Sesi belajar</p>
                    </div>
                  </div>
                  {selectedEvent.topics.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Topik dipelajari:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvent.topics.map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
