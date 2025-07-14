'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GarageDashboard() {
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (type !== 'garage') {
      router.push('/garage/login');
    }
  }, [router]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome, Garage Manager 🧰</h1>
    </main>
  );
}
