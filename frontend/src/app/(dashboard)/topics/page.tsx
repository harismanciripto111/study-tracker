'use client';

import { useEffect, useState, useCallback } from 'react';
import { Topic } from '@/types';
import { topicsApi } from '@/lib/api';
import { progressApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PageWrapper from '@/components/layout/PageWrapper';
import TopicList from '@/components/topics/TopicList';
import TopicForm, { TopicFormData } from '@/components/topics/TopicForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'math', label: 'Matematika' },
  { value: 'science', label: 'Sains' },
  { value: 'language', label: 'Bahasa' },
  { value: 'history', label: 'Sejarah' },
  { value: 'programming', label: 'Pemrograman' },
  { value: 'other', label: 'Lainnya' },
];

interface TopicWithStats extends Topic {
  totalMinutes?: number;
  targetMinutes?: number;
}

export default function TopicsPage() {
  useAuth();
  const { toast } = useToast();

  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicWithStats | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const [topicsRes, progressRes] = await Promise.all([
        topicsApi.list(),
        progressApi.list(),
      ]);
      const progressData = progressRes.data?.data ?? [];

      const minutesByTopic: Record<string, number> = {};
      for (const log of progressData) {
        minutesByTopic[log.topicId] = (minutesByTopic[log.topicId] ?? 0) + (log.duration ?? 0);
      }

      const enriched: TopicWithStats[] = (topicsRes.data?.data ?? []).map((t: Topic) => ({
        ...t,
        totalMinutes: minutesByTopic[t.id] ?? 0,
        targetMinutes: 600,
      }));

      setTopics(enriched);
    } catch {
      toast({ title: 'Gagal memuat topik', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const filtered = topics.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || t.category === category;
    return matchSearch && matchCat;
  });

  const handleSubmit = async (data: TopicFormData) => {
    try {
      setSubmitting(true);
      if (editingTopic) {
        await topicsApi.update(editingTopic.id, data);
        toast({ title: 'Topik berhasil diperbarui' });
      } else {
        await topicsApi.create(data);
        toast({ title: 'Topik berhasil ditambahkan' });
      }
      setDialogOpen(false);
      setEditingTopic(null);
      await fetchTopics();
    } catch {
      toast({ title: 'Gagal menyimpan topik', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic as TopicWithStats);
    setDialogOpen(true);
  };

  const handleDelete = async (topic: Topic) => {
    if (!confirm(`Hapus topik "${topic.title}"?`)) return;
    try {
      await topicsApi.delete(topic.id);
      toast({ title: 'Topik dihapus' });
      await fetchTopics();
    } catch {
      toast({ title: 'Gagal menghapus topik', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper
      title="Topik Belajar"
      description="Kelola topik dan materi belajarmu"
      actions={
        <Button onClick={() => { setEditingTopic(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Topik
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari topik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <TopicList
          topics={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTopic(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTopic ? 'Edit Topik' : 'Tambah Topik Baru'}</DialogTitle>
          </DialogHeader>
          <TopicForm
            defaultValues={editingTopic ? {
              title: editingTopic.title,
              description: editingTopic.description,
              category: editingTopic.category,
              color: editingTopic.color,
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setDialogOpen(false); setEditingTopic(null); }}
            isLoading={submitting}
            submitLabel={editingTopic ? 'Simpan Perubahan' : 'Tambah Topik'}
          />
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
