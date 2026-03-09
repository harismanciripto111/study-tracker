'use client';
import { useState } from 'react';
import { Flame, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StreakData } from '@/types';
import { streakApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface StreakWidgetProps {
  streak: StreakData;
  onCheckIn?: (updated: StreakData) => void;
}

export default function StreakWidget({ streak, onCheckIn }: StreakWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localStreak, setLocalStreak] = useState(streak);

  const handleCheckIn = async () => {
    if (localStreak.checkedInToday) return;
    setLoading(true);
    setError('');
    try {
      const res = await streakApi.checkIn();
      const updated = res.data.data || res.data;
      setLocalStreak(updated);
      onCheckIn?.(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak Belajar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-orange-500">{localStreak.currentStreak}</p>
            <p className="text-xs text-muted-foreground">hari berturut-turut</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{localStreak.longestStreak}</p>
            <p className="text-xs text-muted-foreground">terpanjang</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={localStreak.checkedInToday ? 'default' : 'outline'} className="text-xs">
            {localStreak.checkedInToday ? 'Sudah check-in hari ini' : 'Belum check-in'}
          </Badge>
          <p className="text-xs text-muted-foreground">{localStreak.totalCheckIns} total check-in</p>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          onClick={handleCheckIn}
          disabled={localStreak.checkedInToday || loading}
          className="w-full"
          variant={localStreak.checkedInToday ? 'secondary' : 'default'}
          size="sm"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Check-in...</>
          ) : localStreak.checkedInToday ? (
            <><CheckCircle className="mr-2 h-4 w-4" /> Sudah Check-in</>
          ) : (
            <><Flame className="mr-2 h-4 w-4" /> Check-in Sekarang</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
