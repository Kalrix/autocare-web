'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    const { data, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // 
      .single();

    if (fetchError || !data) {
      setError('Invalid credentials');
      return;
    }

    // TODO: store session/token or redirect
    router.push('/dashboard'); // change this as needed
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-sm border border-black shadow-lg">
        <CardContent className="py-8 px-6 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-black text-center">AutoCare24 | Admin Login</h1>

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-black text-black"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-black text-black"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              onClick={handleLogin}
              className="bg-black text-white hover:bg-gray-800"
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
