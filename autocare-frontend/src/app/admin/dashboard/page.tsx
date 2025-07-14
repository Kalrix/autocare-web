'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    if (type !== 'admin') {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-16 md:ml-64 p-6 transition-all duration-300 w-full">
        <h1 className="text-2xl font-bold">Welcome, Admin 🚀</h1>
      </main>
    </div>
  );
}
