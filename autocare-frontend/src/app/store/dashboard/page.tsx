'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StoreSidebar from '@/app/store/components/StoreSidebar';

export default function StoreDashboard() {
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (type !== 'store') {
      router.push('/store/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <StoreSidebar />

      <div className="flex-1 bg-gray-50">
        {/* Main Content Placeholder */}
        <main className="flex items-center justify-center h-full p-6">
          <h2 className="text-2xl font-bold text-gray-500">Dashboard Coming Soon 🚧</h2>
        </main>
      </div>
    </div>
  );
}
