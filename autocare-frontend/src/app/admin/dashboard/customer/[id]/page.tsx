'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fetchFromAPI } from '@/lib/api';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface Customer {
  full_name: string;
  phone_number: string;
  email?: string;
  address?: Address;
  source: 'main_admin' | 'hub_admin' | 'garage_admin' | 'website';
  is_active: boolean;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer>({
    full_name: '',
    phone_number: '',
    email: '',
    address: { line1: '', city: '', pincode: '' },
    source: 'main_admin',
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(id as string);
    }
  }, [id]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const data = await fetchFromAPI<Customer>(`/api/customers/${customerId}`);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetchFromAPI(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      });
      router.push('/admin/dashboard/customer');
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Edit Customer</h2>

      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={customer.full_name}
            onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            value={customer.phone_number}
            onChange={(e) => setCustomer({ ...customer, phone_number: e.target.value })}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            value={customer.email || ''}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
        </div>

        <div>
          <Label>Source</Label>
          <select
            value={customer.source}
            onChange={(e) => setCustomer({ ...customer, source: e.target.value as Customer['source'] })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="main_admin">Main Admin</option>
            <option value="hub_admin">Hub Admin</option>
            <option value="garage_admin">Garage Admin</option>
            <option value="website">Website</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>Address Line</Label>
            <Input
              value={customer.address?.line1 || ''}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  address: { ...customer.address, line1: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={customer.address?.city || ''}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  address: { ...customer.address, city: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input
              value={customer.address?.pincode || ''}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  address: { ...customer.address, pincode: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={customer.is_active}
            onChange={(e) => setCustomer({ ...customer, is_active: e.target.checked })}
          />
          <span>Is Active</span>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
