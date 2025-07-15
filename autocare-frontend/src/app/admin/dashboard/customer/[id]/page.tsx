'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchFromAPI } from '@/lib/api';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface Vehicle {
  id: string;
  model: string;
  plate_number: string;
  brand?: string;
}

interface LoyaltyCard {
  id: string;
  card_number: string;
  points: number;
  tier: string;
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
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails(id as string);
    }
  }, [id]);

  const fetchDetails = async (customerId: string) => {
    try {
      const [cust, vehs, card] = await Promise.all([
  fetchFromAPI<Customer>(`/api/customers/${customerId}`),
  fetchFromAPI<Vehicle[]>(`/api/customers/${customerId}/vehicles`),
  fetchFromAPI<LoyaltyCard | null>(`/api/customers/${customerId}/loyalty-card`),
]);

      setCustomer(cust);
      setVehicles(vehs);
      setLoyaltyCard(card);
    } catch (error) {
      console.error('Error loading customer data:', error);
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

  if (!customer) return <div className="p-6 text-center">Loading customer...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="profile">Edit Info</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Card</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 py-4">
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
                maxLength={10}
                type="tel"
                value={customer.phone_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCustomer({ ...customer, phone_number: val });
                }}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={customer.email || ''}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
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

            <div>
              <Label>Source</Label>
              <select
                value={customer.source}
                onChange={(e) =>
                  setCustomer({ ...customer, source: e.target.value as Customer['source'] })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="main_admin">Main Admin</option>
                <option value="hub_admin">Hub Admin</option>
                <option value="garage_admin">Garage Admin</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
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
        </TabsContent>

        <TabsContent value="vehicles">
          {vehicles.length === 0 ? (
            <p className="text-sm text-gray-500">No vehicles linked to this customer.</p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((v) => (
                <Card key={v.id}>
                  <CardContent className="p-4">
                    <p className="font-semibold">{v.model}</p>
                    <p className="text-sm text-gray-500">{v.plate_number}</p>
                    {v.brand && <p className="text-sm text-gray-400">{v.brand}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loyalty">
          {!loyaltyCard ? (
            <p className="text-sm text-gray-500">No loyalty card assigned.</p>
          ) : (
            <Card>
              <CardContent className="p-4">
                <p><strong>Card Number:</strong> {loyaltyCard.card_number}</p>
                <p><strong>Points:</strong> {loyaltyCard.points}</p>
                <p><strong>Tier:</strong> {loyaltyCard.tier}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
