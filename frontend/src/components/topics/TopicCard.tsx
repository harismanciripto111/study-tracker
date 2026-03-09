'use client';

import { Topic } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProgressBar from '@/components/progress/ProgressBar';
import { BookOpen, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  totalMinutes?: number;
  targetMinutes?: number;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  math: 'bg-blue-100 text-blue-700',
  science: 'bg-green-100 text-green-700',
  language: 'bg-purple-100 text-purple-700',
  history: 'bg-yellow-100 text-yellow-700',
  programming: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function TopicCard({
  topic,
  totalMinutes = 0,
  targetMinutes = 120,
  onEdit,
  onDelete,
}: TopicCardProps) {
  const progress = targetMinutes > 0 ? Math.min(100, (totalMinutes / targetMinutes) * 100) : 0;
  const categoryKey = (topic.category || 'other').toLowerCase();
  const colorClass = CATEGORY_COLORS[categoryKey] ?? CATEGORY_COLORS.other;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: topic.color || '#6366f1' }}
            />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
              {topic.title}
            </h3>
          </div>
          {topic.category && (
            <span
              className={cn(
                'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
                colorClass
              )}
            >
              {topic.category}
            </span>
          )}
        </div>
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(topic)}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(topic)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {topic.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {topic.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {topic._count?.progressLogs ?? 0} sesi
          </span>
        </div>
        <ProgressBar value={progress} size="sm" />
      </CardContent>
    </Card>
  );
}
