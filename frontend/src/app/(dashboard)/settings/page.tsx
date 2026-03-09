'use client';
import { useState, useEffect } from 'react';
import { Save, User, Bell, Shield, Palette, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await api.put('/auth/profile', profileData);
      setUser(res.data.data);
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password baru minimal 8 karakter' });
      return;
    }
    try {
      setSavingPassword(true);
      setPasswordMsg(null);
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PageWrapper title="Pengaturan" description="Kelola akun dan preferensi aplikasimu">
      <div className="max-w-2xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profil</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" />Keamanan</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" />Tampilan</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Perbarui nama dan email akunmu</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {(profileData.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{profileData.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{user?.role === 'ADMIN' ? 'Admin' : 'Student'}</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Nama lengkapmu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@contoh.com"
                    />
                  </div>
                  {profileMsg && (
                    <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                      {profileMsg.text}
                    </p>
                  )}
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : <><Save className="mr-2 h-4 w-4" />Simpan Perubahan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>Pastikan akunmu aman dengan password yang kuat</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Password saat ini"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Ulangi password baru"
                    />
                  </div>
                  {passwordMsg && (
                    <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                      {passwordMsg.text}
                    </p>
                  )}
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengubah...</> : <><Shield className="mr-2 h-4 w-4" />Ubah Password</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Tampilan</CardTitle>
                <CardDescription>Sesuaikan tampilan aplikasi sesuai preferensimu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tema</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Pilih tema terang atau gelap</p>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 border-2 border-primary rounded-lg p-3 text-sm font-medium bg-white text-gray-900"
                      onClick={() => document.documentElement.classList.remove('dark')}>
                      Terang
                    </button>
                    <button
                      className="flex-1 border-2 border-border rounded-lg p-3 text-sm font-medium bg-gray-900 text-white"
                      onClick={() => document.documentElement.classList.add('dark')}>
                      Gelap
                    </button>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Informasi Aplikasi</Label>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Versi</span><span>1.0.0</span></div>
                    <div className="flex justify-between"><span>Framework</span><span>Next.js 14</span></div>
                    <div className="flex justify-between"><span>Database</span><span>PostgreSQL + Prisma</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
