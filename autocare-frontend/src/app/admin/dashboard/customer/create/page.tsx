'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { fetchFromAPI } from '@/lib/api';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type CustomerSource = 'main_admin' | 'hub_admin' | 'garage_admin' | 'website';

interface Address {
  line1: string;
  city: string;
  pincode: string;
}

interface Store {
  id: string;
  name: string;
}

interface FormData {
  full_name: string;
  phone_number: string;
  email: string;
  source: CustomerSource;
  address: Address;
  latitude: string;
  longitude: string;
  store_id: string;
}

export default function CreateCustomer() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone_number: '',
    email: '',
    source: 'main_admin',
    address: { line1: '', city: '', pincode: '' },
    latitude: '',
    longitude: '',
    store_id: '',
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetchFromAPI('/api/stores');
        setStores(res);
      } catch {
        setStores([]);
      }
    };
    fetchStores();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const payload: any = {
      ...formData,
      address: { ...formData.address },
    };

    if (formData.latitude && formData.longitude) {
      payload.latitude = formData.latitude;
      payload.longitude = formData.longitude;
    }

    try {
      // Check duplicate by phone or email
      const existing = await fetchFromAPI('/api/customers');
      const alreadyExists = existing.some((c: any) => 
        c.phone_number === formData.phone_number || 
        (formData.email && c.email === formData.email)
      );

      if (alreadyExists) {
        setError('Customer already exists with this phone number or email.');
        setLoading(false);
        return;
      }

      await fetchFromAPI('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      router.push('/admin/dashboard/customer');
    } catch (err) {
      console.error('Failed to create customer:', err);
      setError('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Create Customer</h2>
            <Link
              href="/admin/dashboard/customer"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Customers
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={formData.phone_number}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setFormData({ ...formData, phone_number: value });
                  }
                }}
              />
            </div>

            <div>
              <Label>Email (optional)</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Source</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value as CustomerSource })
                }
              >
                <option value="main_admin">Main Admin</option>
                <option value="hub_admin">Hub Admin</option>
                <option value="garage_admin">Garage Admin</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label>Store</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.store_id}
                onChange={(e) =>
                  setFormData({ ...formData, store_id: e.target.value })
                }
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label>Address Line 1</Label>
              <Input
                value={formData.address.line1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, line1: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>City</Label>
              <Input
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>Pincode</Label>
              <Input
                value={formData.address.pincode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, pincode: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label>Latitude</Label>
              <Input
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Longitude</Label>
              <Input
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              disabled={loading}
              onClick={handleSubmit}
              className="w-full md:w-auto"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              Create Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
