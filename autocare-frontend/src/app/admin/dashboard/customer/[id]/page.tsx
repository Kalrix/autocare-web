'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { fetchFromAPI } from '@/lib/api';
import AdminSidebar from '@/app/admin/components/AdminSidebar';

interface Address {
  line1?: string;
  city?: string;
  pincode?: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  brand?: string;
  model?: string;
}

interface LoyaltyCard {
  id: string;
  card_number: string;
  points_balance: number;
  tier: string;
}

interface Customer {
  id: string;
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
  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null | 'not_found'>(null);

  useEffect(() => {
    if (id) fetchDetails(id as string);
  }, [id]);

  const fetchDetails = async (customerId: string) => {
    try {
      const [cust, vehs] = await Promise.all([
        fetchFromAPI<Customer>(`/api/customers/${customerId}`),
        fetchFromAPI<Vehicle[]>(`/api/customers/${customerId}/vehicles`)
      ]);
      setCustomer(cust);
      setVehicles(vehs);

      try {
        const card = await fetchFromAPI<LoyaltyCard>(
          `/api/customers/${customerId}/loyalty-card`
        );
        setLoyaltyCard(card);
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('404')) {
          setLoyaltyCard('not_found');
        } else {
          console.error('Loyalty card fetch error:', error);
        }
      }
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

  if (!customer) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="p-6 text-center w-full">Loading customer...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="w-full max-w-5xl p-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-800">Edit Customer</h1>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Edit Info</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Card</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block mb-1">Full Name</Label>
                    <Input
                      value={customer.full_name}
                      onChange={(e) =>
                        setCustomer({ ...customer, full_name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label className="block mb-1">Phone Number</Label>
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

                  <div className="md:col-span-2">
                    <Label className="block mb-1">Email</Label>
                    <Input
                      value={customer.email || ''}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="block mb-1">Address Line</Label>
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
                    <Label className="block mb-1">City</Label>
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
                    <Label className="block mb-1">Pincode</Label>
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
                  <Label className="block mb-1">Source</Label>
                  <select
                    value={customer.source}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        source: e.target.value as Customer['source'],
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customer.is_active}
                    onChange={(e) =>
                      setCustomer({ ...customer, is_active: e.target.checked })
                    }
                  />
                  <span className="text-sm text-gray-700">Is Active</span>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            {vehicles.length === 0 ? (
              <p className="text-sm text-gray-500">No vehicles linked to this customer.</p>
            ) : (
              <div className="space-y-4">
                {vehicles.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="p-4 space-y-1">
                      <p className="font-semibold">{v.vehicle_number}</p>
                      <p className="text-sm text-gray-600 capitalize">{v.vehicle_type}</p>
                      {v.brand && <p className="text-sm text-gray-400">{v.brand}</p>}
                      {v.model && (
                        <p className="text-sm text-gray-400 italic">{v.model}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="loyalty">
            {loyaltyCard === null || loyaltyCard === 'not_found' ? (
              <p className="text-sm text-gray-500">No loyalty card assigned.</p>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-1">
                  <p><strong>Card Number:</strong> {loyaltyCard.card_number}</p>
                  <p><strong>Points:</strong> {loyaltyCard.points_balance}</p>
                  <p><strong>Tier:</strong> {loyaltyCard.tier}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
