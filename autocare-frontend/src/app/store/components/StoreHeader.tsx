'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { fetchFromAPI } from '@/lib/api';

interface Store {
  name: string;
  alias: string;
  address: string;
  manager_name: string;
}

export default function StoreHeader() {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const storeId = localStorage.getItem('store_id');
    if (storeId) {
      fetchStore(storeId);
    }
  }, []);

  const fetchStore = async (id: string) => {
    try {
      const data = await fetchFromAPI<Store>(`/api/stores/${id}`);
      setStore(data);
    } catch (err) {
      console.error('Failed to fetch store:', err);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 md:px-6 border-b bg-white shadow-sm">
      {/* Store Info */}
      <div className="space-y-0.5">
        <h1 className="text-lg font-semibold text-gray-800">
          {store?.name || 'Store'} - {store?.alias || 'Alias'}
        </h1>
        <p className="text-sm text-gray-500">
          {store?.manager_name && `Manager: ${store.manager_name}`} <br />
          {store?.address}
        </p>
      </div>

      {/* Notification Icon */}
      <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
        <Bell className="w-5 h-5 text-gray-600" />
        {/* Optionally add badge */}
        {/* <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" /> */}
      </button>
    </div>
  );
}
