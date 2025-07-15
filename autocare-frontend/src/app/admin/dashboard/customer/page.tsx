'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { fetchFromAPI } from '@/lib/api';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { Pencil, Trash, Eye } from 'lucide-react';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface Customer {
  _id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address?: Address;
  source: 'main_admin' | 'hub_admin' | 'garage_admin' | 'website';
  is_active: boolean;
  created_at: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchCustomers = async () => {
    try {
      const data = await fetchFromAPI<Customer[]>(
        `/api/customers?page=${page}&limit=${limit}`
      );
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetchFromAPI(`/api/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
          <Button onClick={() => router.push('/admin/dashboard/customer/create')}>
            + Create Customer
          </Button>
        </div>

        <Card className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2 hidden sm:table-cell">Email</th>
                <th className="px-4 py-2 hidden md:table-cell">City</th>
                <th className="px-4 py-2 hidden lg:table-cell">Source</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{customer.full_name}</td>
                  <td className="px-4 py-2">{customer.phone_number}</td>
                  <td className="px-4 py-2 hidden sm:table-cell">{customer.email || '-'}</td>
                  <td className="px-4 py-2 hidden md:table-cell">{customer.address?.city || '-'}</td>
                  <td className="px-4 py-2 hidden lg:table-cell capitalize">
                    {customer.source.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-2 flex gap-2 items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/dashboard/customer/view/${customer._id}`)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/dashboard/customer/edit/${customer._id}`)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(customer._id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
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
