'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import StoreSidebar from '@/app/store/components/StoreSidebar';
import { fetchFromAPI } from '@/lib/api';

interface Store {
  name: string;
  alias: string;
  address: string;
}

export default function StoreDashboard() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('user_type');
    const storeId = localStorage.getItem('store_id');

    if (type !== 'store') {
      router.push('/store/login');
      return;
    }

    if (storeId) {
      fetchStoreDetails(storeId);
    }
  }, [router]);

  const fetchStoreDetails = async (storeId: string) => {
    try {
      const data = await fetchFromAPI<Store>(`/api/stores/${storeId}`);
      setStore(data);
    } catch (error) {
      console.error('Failed to fetch store details:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <StoreSidebar />

      <div className="flex-1 bg-gray-50">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {store?.name || 'Loading...'}
            </h1>
            <p className="text-sm text-gray-500">{store?.address}</p>
          </div>

          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6">
          <h2 className="text-xl font-bold text-gray-800">
            {store ? `Welcome, ${store.name} - ${store.alias} 🏢` : 'Loading...'}
          </h2>
        </main>
      </div>
    </div>
  );
}
