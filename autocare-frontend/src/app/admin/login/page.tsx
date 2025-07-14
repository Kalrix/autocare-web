'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      // Call your Python backend API for admin login
      const data = await fetchFromAPI('/api/admin-users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('user_type', 'admin');
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-sm border shadow">
        <CardContent className="py-8 flex flex-col gap-4">
            
          <h2 className="text-xl font-bold text-center">Autocare24 | Admin Login</h2>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
