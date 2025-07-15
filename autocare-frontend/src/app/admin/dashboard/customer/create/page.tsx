'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fetchFromAPI } from '@/lib/api';

export default function CreateCustomer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    source: 'main_admin',
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
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Customer</h2>

      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <div>
          <Label>Phone Number</Label>
          <Input
            placeholder="9876543210"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          />
        </div>

        <div>
          <Label>Email (optional)</Label>
          <Input
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <Label>Source</Label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="main_admin">Main Admin</option>
            <option value="hub_admin">Hub Admin</option>
            <option value="garage_admin">Garage Admin</option>
            <option value="website">Website</option>
          </select>
        </div>

        <Button onClick={handleSubmit}>Create</Button>
      </div>
    </div>
  );
}
