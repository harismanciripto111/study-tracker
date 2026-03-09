import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProgressBar from '@/components/progress/ProgressBar';
import { Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

interface QuizResultProps { score: number; total: number; timeTaken?: number; onRetry?: () => void; }

export default function QuizResult({ score, total, timeTaken, onRetry }: QuizResultProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const grade = pct >= 80 ? { label: 'Luar Biasa!', color: 'text-green-600' } : pct >= 60 ? { label: 'Bagus!', color: 'text-blue-600' } : { label: 'Perlu Latihan', color: 'text-orange-600' };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3"><Trophy className={`h-12 w-12 ${grade.color}`} /></div>
        <CardTitle className={`text-2xl ${grade.color}`}>{grade.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold">{pct}%</p>
          <p className="text-muted-foreground text-sm mt-1">{score} dari {total} soal benar</p>
          {timeTaken && <p className="text-xs text-muted-foreground">Waktu: {Math.round(timeTaken/60)}m {timeTaken%60}s</p>}
        </div>
        <ProgressBar value={pct} showLabel size="lg" />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950"><CheckCircle className="h-4 w-4 text-green-600" /><div><p className="text-xs text-muted-foreground">Benar</p><p className="font-semibold text-green-600">{score}</p></div></div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950"><XCircle className="h-4 w-4 text-red-600" /><div><p className="text-xs text-muted-foreground">Salah</p><p className="font-semibold text-red-600">{total - score}</p></div></div>
        </div>
        {onRetry && <Button onClick={onRetry} variant="outline" className="w-full"><RotateCcw className="mr-2 h-4 w-4" />Coba Lagi</Button>}
      </CardContent>
    </Card>
  );
}
