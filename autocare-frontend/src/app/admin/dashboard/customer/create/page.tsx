'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { fetchFromAPI } from '@/lib/api';
import { ChevronLeft } from 'lucide-react';

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

interface Customer {
  phone_number: string;
  email?: string;
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

interface CustomerPayload {
  full_name: string;
  phone_number: string;
  source: CustomerSource;
  store_id: string;
  email?: string;
  address?: Address;
  latitude?: string;
  longitude?: string;
}

export default function CreateCustomer() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
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
        const data = await fetchFromAPI<Store[]>('/api/stores');
        setStores(data);
      } catch (err) {
        console.error('Failed to load stores:', err);
      }
    };
    fetchStores();
  }, []);

  const handleSubmit = async () => {
    try {
      const allCustomers = await fetchFromAPI<Customer[]>('/api/customers');
      const exists = allCustomers.find(
        (c: Customer) =>
          c.phone_number === formData.phone_number ||
          (formData.email && c.email === formData.email)
      );
      if (exists) {
        alert('Customer with this phone or email already exists.');
        return;
      }

      const payload: CustomerPayload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        source: formData.source,
        store_id: formData.store_id,
      };

      if (formData.email.trim()) payload.email = formData.email;
      if (
        formData.address.line1 ||
        formData.address.city ||
        formData.address.pincode
      ) {
        payload.address = formData.address;
      }
      if (formData.latitude && formData.longitude) {
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await fetchFromAPI('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      router.push('/admin/dashboard/customer');
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create Customer</h2>
            <Button variant="ghost" onClick={() => router.back()}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="9876543210"
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
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Source</Label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as CustomerSource,
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="main_admin">Main Admin</option>
                <option value="hub_admin">Hub Admin</option>
                <option value="garage_admin">Garage Admin</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label>Assign to Store</Label>
              <select
                value={formData.store_id}
                onChange={(e) =>
                  setFormData({ ...formData, store_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a store</option>
                {stores.map((store: Store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label>Address Line 1</Label>
              <Input
                placeholder="Street, Area"
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
                placeholder="City"
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
                placeholder="123456"
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
                placeholder="e.g. 23.45678"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Longitude</Label>
              <Input
                placeholder="e.g. 77.12345"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit}>Create Customer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
