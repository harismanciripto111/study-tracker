import { Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressLog } from '@/types';
import { formatDuration, formatRelative, stringToColor } from '@/lib/utils';

interface RecentSessionsProps {
  sessions: ProgressLog[];
}

export default function RecentSessions({ sessions }: RecentSessionsProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sesi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada sesi belajar</p>
            <p className="text-xs text-muted-foreground mt-1">Mulai catat sesi belajarmu!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sesi Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: stringToColor(session.topic?.title || session.topicId) }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.topic?.title || 'Topik tidak diketahui'}
                </p>
                {session.note && (
                  <p className="text-xs text-muted-foreground truncate">{session.note}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <Badge variant="secondary" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {formatDuration(session.duration)}
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {formatRelative(session.studiedAt)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
