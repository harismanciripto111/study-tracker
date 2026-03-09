'use client';

import { Topic } from '@/types';
import TopicCard from './TopicCard';
import { BookOpen } from 'lucide-react';

interface TopicWithStats extends Topic {
  totalMinutes?: number;
  targetMinutes?: number;
}

interface TopicListProps {
  topics: TopicWithStats[];
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
  emptyMessage?: string;
}

export default function TopicList({
  topics,
  onEdit,
  onDelete,
  emptyMessage = 'Belum ada topik. Tambahkan topik pertamamu!',
}: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          totalMinutes={topic.totalMinutes}
          targetMinutes={topic.targetMinutes}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
