'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GarageLoginResponse {
  store_id: string;
  type: 'garage';
}

export default function GarageLogin() {
  const router = useRouter();
  const [storeId, setStoreId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    try {
      const data = await fetchFromAPI<GarageLoginResponse>('/api/store-admin/login', {
        method: 'POST',
        body: JSON.stringify({ alias: storeId, password }),
      });

      if (!data || !data.store_id || data.type !== 'garage') {
        setError('Invalid ID or password');
        return;
      }

      localStorage.setItem('user_type', 'garage');
      localStorage.setItem('store_id', data.store_id);
      router.push('/garage/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid ID or password');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-sm border shadow">
        <CardContent className="py-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">Garage Login</h2>

          <Input
            placeholder="Alias (e.g., AC24XYZ)"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button onClick={handleLogin}>Login</Button>
        </CardContent>
      </Card>
    </main>
  );
}
