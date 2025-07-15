'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import StoreSidebar from '@/app/store/components/StoreSidebar';
import { fetchFromAPI } from '@/lib/api';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface CustomerForm {
  full_name: string;
  phone_number: string;
  email?: string;
  address?: Address;
}

export default function CreateCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>({
    full_name: '',
    phone_number: '',
    email: '',
    address: { line1: '', city: '', pincode: '' },
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CustomerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const storeId = localStorage.getItem('store_id');
    const storeType = localStorage.getItem('store_type'); // 'hub' | 'garage'

    if (!storeId || !storeType) {
      alert('Store ID or type missing. Please log in again.');
      return;
    }

    if (!form.full_name || !form.phone_number) {
      alert('Full name and phone number are required.');
      return;
    }

    const payload = {
      ...form,
      store_id: storeId,
      onboarded_by: storeId,
      source: storeType === 'garage' ? 'garage_admin' : 'hub_admin',
    };

    try {
      setLoading(true);
      await fetchFromAPI('/api/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/store/customers');
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Failed to create customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StoreSidebar />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Create Customer</h2>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card className="max-w-2xl p-6 space-y-5 shadow">
          <div>
            <Label htmlFor="full_name" className="mb-1 block">Full Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone_number" className="mb-1 block">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              maxLength={10}
              value={form.phone_number}
              onChange={(e) =>
                handleChange('phone_number', e.target.value.replace(/\D/g, ''))
              }
              placeholder="10-digit phone number"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-1 block">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <Label htmlFor="address_line1" className="mb-1 block">Address Line</Label>
            <Input
              id="address_line1"
              value={form.address?.line1 || ''}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
              placeholder="House No, Street, etc."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="mb-1 block">City</Label>
              <Input
                id="city"
                value={form.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pincode" className="mb-1 block">Pincode</Label>
              <Input
                id="pincode"
                value={form.address?.pincode || ''}
                onChange={(e) => handleAddressChange('pincode', e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Creating...' : 'Create Customer'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
