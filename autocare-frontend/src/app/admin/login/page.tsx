'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'admin' | 'store'>('admin');

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [storeAlias, setStoreAlias] = useState('');
  const [storePassword, setStorePassword] = useState('');
  const [storeError, setStoreError] = useState('');

  const handleAdminLogin = async () => {
    setAdminError('');
    try {
      await fetchFromAPI('/api/admin-users/login', {
        method: 'POST',
        body: JSON.stringify({
          username: adminId,
          password: adminPassword,
        }),
      });

      localStorage.setItem('user_type', 'admin');
      router.push('/admin/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
      }
      setAdminError('Invalid admin ID or password');
    }
  };

  const handleStoreLogin = async () => {
    setStoreError('');
    try {
      const alias = storeAlias.replace('Autocare24-', '').trim();

      const res = await fetchFromAPI<{ id: string; type: 'hub' | 'garage' }>('/api/store-admin/login', {
        method: 'POST',
        body: JSON.stringify({
          alias,
          password: storePassword,
        }),
      });

      localStorage.setItem('user_type', res.type);
      localStorage.setItem('store_id', res.id);

      const redirectPath = res.type === 'hub' ? '/store/dashboard' : '/garage/dashboard';
      router.push(redirectPath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
      }
      setStoreError('Invalid alias or password');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Welcome to AutoCare
          </h1>

          <Tabs value={tab} onValueChange={(value) => setTab(value as 'admin' | 'store')} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
              <TabsTrigger value="store">Store Login</TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Unique ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                {adminError && <p className="text-sm text-red-600">{adminError}</p>}
                <Button onClick={handleAdminLogin} className="w-full">
                  Login as Admin
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="store">
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Autocare24-alias"
                  value={storeAlias}
                  onChange={(e) => setStoreAlias(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                />
                {storeError && <p className="text-sm text-red-600">{storeError}</p>}
                <Button onClick={handleStoreLogin} className="w-full">
                  Login as Store
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
