'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TopicForm from '@/components/topics/TopicForm';
import { api } from '@/lib/api';
import { Topic } from '@/types';
import { type TopicFormData } from '@/lib/validations';
import { Skeleton } from '@/components/ui/skeleton';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/topics');
      setTopics(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleSubmit = async (data: TopicFormData) => {
    if (editing) {
      await api.put(`/topics/${editing.id}`, data);
    } else {
      await api.post('/topics', data);
    }
    setOpen(false);
    setEditing(null);
    fetchTopics();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus topik ini?')) return;
    await api.delete(`/topics/${id}`);
    fetchTopics();
  };

  const filtered = topics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="Topik Belajar" description="Kelola topik dan mata pelajaran yang kamu pelajari">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari topik..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Tambah Topik
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">Belum ada topik</p>
          <p className="text-sm">Klik "Tambah Topik" untuk mulai</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(topic => (
            <Card key={topic.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: topic.color || '#6366f1' }} />
                    <CardTitle className="text-base line-clamp-1">{topic.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(topic); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(topic.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {topic.description && <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>}
                {topic.category && <Badge variant="secondary" className="text-xs">{topic.category}</Badge>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>{topic._count?.sessions ?? 0} sesi</span>
                  <span>{topic._count?.quizzes ?? 0} kuis</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Topik' : 'Tambah Topik Baru'}</DialogTitle>
          </DialogHeader>
          <TopicForm
            onSubmit={handleSubmit}
            defaultValues={editing || undefined}
            submitLabel={editing ? 'Simpan Perubahan' : 'Tambah Topik'}
          />
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
