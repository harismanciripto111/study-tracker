'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi, topicsApi } from '@/lib/api';
import { User, Topic } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import PageWrapper from '@/components/layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Search, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await adminApi.getUsers();
      setUsers(res.data?.data ?? []);
    } catch {
      toast({ title: 'Gagal memuat data users', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoadingTopics(true);
      const res = await adminApi.getTopics();
      setTopics(res.data?.data ?? []);
    } catch {
      toast({ title: 'Gagal memuat data topik', variant: 'destructive' });
    } finally {
      setLoadingTopics(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    fetchTopics();
  }, [fetchUsers, fetchTopics]);

  const handleDeleteTopic = async (topic: Topic) => {
    if (!confirm(`Hapus topik "${topic.title}"?`)) return;
    try {
      await topicsApi.delete(topic.id);
      toast({ title: 'Topik berhasil dihapus' });
      await fetchTopics();
    } catch {
      toast({ title: 'Gagal menghapus topik', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
      (t.category ?? '').toLowerCase().includes(topicSearch.toLowerCase())
  );

  if (user?.role !== 'ADMIN') return null;

  return (
    <PageWrapper title="Admin Panel" description="Kelola pengguna dan konten aplikasi">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-gray-500">Total Pengguna</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{topics.length}</p>
              <p className="text-xs text-gray-500">Total Topik</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="topics">Topik</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari pengguna..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingUsers ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bergabung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                          Tidak ada pengguna ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'text-xs',
                                u.role === 'ADMIN'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              )}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {new Date(u.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics">
          <Card>
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari topik..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTopics ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Sesi</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTopics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          Tidak ada topik ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTopics.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: t.color || '#6366f1' }}
                              />
                              <span className="font-medium">{t.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {t.category ? (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {t.category}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {t._count?.progressLogs ?? 0}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {new Date(t.createdAt).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteTopic(t)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
