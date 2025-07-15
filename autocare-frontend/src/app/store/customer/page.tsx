'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchFromAPI } from '@/lib/api';
import { Eye } from 'lucide-react';
import StoreSidebar from '@/app/store/components/StoreSidebar';

interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  created_at: string;
  source: string;
  is_active: boolean;
}

export default function StoreCustomerListPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchCustomers = async () => {
      const storeId = localStorage.getItem('store_id');
      if (!storeId) return;

      setLoading(true);
      try {
        const data = await fetchFromAPI<Customer[]>(
          `/api/customers?store_id=${storeId}&page=${page}&limit=${limit}`
        );
        setCustomers(
          Array.isArray(data) ? data.filter((c) => c.is_active) : []
        );
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StoreSidebar />

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            My Customers
          </h2>
          <Button onClick={() => router.push('/store/customer/create')}>
            + Create Customer
          </Button>
        </div>

        <Card className="overflow-x-auto shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2 hidden sm:table-cell">Email</th>
                <th className="px-4 py-2 hidden md:table-cell">Created</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2">{customer.full_name}</td>
                    <td className="px-4 py-2">{customer.phone_number}</td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      {customer.email || '-'}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          router.push(`/store/customer/view/${customer.id}`)
                        }
                      >
                        <Eye size={16} />
                      </Button>
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
