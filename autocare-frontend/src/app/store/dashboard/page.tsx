'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StoreDashboard() {
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (type !== 'store') {
      router.push('/store/login');
    }
  }, [router]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Welcome, Hub Manager 🏢</h1>
    </main>
  );
}
