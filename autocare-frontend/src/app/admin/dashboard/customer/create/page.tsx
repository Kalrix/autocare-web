'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { fetchFromAPI } from '@/lib/api';

type CustomerSource = 'main_admin' | 'hub_admin' | 'garage_admin' | 'website';

interface Address {
  line1: string;
  city: string;
  pincode: string;
}

interface FormData {
  full_name: string;
  phone_number: string;
  email: string;
  source: CustomerSource;
  address: Address;
  latitude: string;
  longitude: string;
}

export default function CreateCustomer() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone_number: '',
    email: '',
    source: 'main_admin',
    address: {
      line1: '',
      city: '',
      pincode: '',
    },
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async () => {
    try {
      await fetchFromAPI('/api/customers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/admin/dashboard/customer');
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-semibold mb-6">Create Customer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
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

            {/* Phone */}
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

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Source */}
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
                className="w-full px-3 py-2 border rounded"
              >
                <option value="main_admin">Main Admin</option>
                <option value="hub_admin">Hub Admin</option>
                <option value="garage_admin">Garage Admin</option>
                <option value="website">Website</option>
              </select>
            </div>

            {/* Address Line */}
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

            {/* City */}
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

            {/* Pincode */}
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

            {/* Latitude */}
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

            {/* Longitude */}
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
