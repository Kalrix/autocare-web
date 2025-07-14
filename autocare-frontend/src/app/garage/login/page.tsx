'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchFromAPI } from '@/lib/api';

// ✅ Define expected response shape
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

    const alias = storeId.replace(/^Autocare24[- ]?/i, '').trim();

    try {
      const data = await fetchFromAPI<GarageLoginResponse>('/api/store-admin/login', {
        method: 'POST',
        body: JSON.stringify({ alias, password }),
      });

      if (!data?.store_id || data.type !== 'garage') {
        setError('Invalid ID or password');
        return;
      }

      localStorage.setItem('user_type', 'garage');
      localStorage.setItem('store_id', data.store_id);
      router.push('/garage/dashboard');
    } catch (err) {
      console.error('Garage login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-sm border shadow">
        <CardContent className="py-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">Autocare24 | Garage Login</h2>

          <Input
            placeholder="Autocare24-alias"
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
