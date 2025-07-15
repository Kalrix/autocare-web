'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchFromAPI } from '@/lib/api';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { Pencil, Trash } from 'lucide-react';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface Store {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address?: Address;
  source: 'main_admin' | 'hub_admin' | 'garage_admin' | 'website';
  is_active: boolean;
  created_at: string;
  store_id?: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeMap, setStoreMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ city: '', storeId: '' });
  const limit = 10;

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await fetchFromAPI<Store[]>('/api/stores');
        setStores(data);
        const mapping = Object.fromEntries(data.map((s) => [s.id, s.name]));
        setStoreMap(mapping);
      } catch (err) {
        console.error('Failed to fetch stores:', err);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (filters.storeId) queryParams.append('store_id', filters.storeId);
        if (filters.city) queryParams.append('city', filters.city);

        const data = await fetchFromAPI<Customer[]>(
          `/api/customers?${queryParams.toString()}`
        );
        setCustomers(Array.isArray(data) ? data.filter((c) => c.is_active) : []);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetchFromAPI(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers((prev) => prev.filter((cust) => cust.id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
          <Button onClick={() => router.push('/admin/dashboard/customer/create')}>
            + Create Customer
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Filter by City"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            className="w-full sm:w-60"
          />
          <select
            className="w-full sm:w-60 border rounded px-3 py-2 text-sm text-gray-700"
            value={filters.storeId}
            onChange={(e) => setFilters((f) => ({ ...f, storeId: e.target.value }))}
          >
            <option value="">All Stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <Card className="overflow-x-auto shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2 hidden sm:table-cell">Email</th>
                <th className="px-4 py-2 hidden md:table-cell">City</th>
                <th className="px-4 py-2 hidden lg:table-cell">Store</th>
                <th className="px-4 py-2 hidden lg:table-cell">Source</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{customer.full_name}</td>
                    <td className="px-4 py-2">{customer.phone_number}</td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      {customer.email || '-'}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {customer.address?.city || '-'}
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      {storeMap[customer.store_id || ''] || '-'}
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell capitalize">
                      {customer.source.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            router.push(`/admin/dashboard/customer/${customer.id}`)
                          }
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-between items-center mt-6">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
