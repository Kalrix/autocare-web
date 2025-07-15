'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { fetchFromAPI } from '@/lib/api';

interface Addon {
  name: string;
  price: number;
}

interface Subservice {
  name: string;
  price: number;
  is_optional: boolean;
  description?: string;
  vehicle_category?: string;
  duration_minutes?: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_active: boolean;
  is_visible_to_customer: boolean;
  is_temporarily_unavailable: boolean;
  addons: Addon[];
  subservices: Subservice[];
}

interface Props {
  taskTypeId: string;
  taskTypeName: string;
}

export default function Subtask({ taskTypeId, taskTypeName }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchFromAPI<Service[]>(`/api/services?task_type_id=${taskTypeId}`)
      .then((data) => setServices(data || []))
      .catch(console.error);
  }, [taskTypeId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await fetchFromAPI(`/api/services/${id}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Deactivation failed:', err);
    }
  };

  const handleSave = async (data: Partial<Service>) => {
    const isEditing = !!selectedService;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/services/${selectedService.id}` : `/api/services`;

    try {
      const updated = await fetchFromAPI<Service>(url, {
        method,
        body: JSON.stringify({ ...data, task_type_id: taskTypeId }),
      });
      setIsDialogOpen(false);
      setSelectedService(null);
      setServices((prev) =>
        isEditing
          ? prev.map((s) => (s.id === updated.id ? updated : s))
          : [...prev, updated]
      );
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services for {taskTypeName}</CardTitle>
        <Button onClick={() => {
          setSelectedService(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Subservices</TableHead>
                <TableHead>Addons</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? 'default' : 'destructive'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_visible_to_customer ? 'secondary' : 'outline'}>
                        {service.is_visible_to_customer ? 'Visible' : 'Hidden'}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.subservices.length}</TableCell>
                    <TableCell>{service.addons.length}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedService(service);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit Service</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Deactivate Service</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No services found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the service. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            service={selectedService}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// --- Service Form ---
function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service?.name ?? '');
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [isVisible, setIsVisible] = useState(service?.is_visible_to_customer ?? true);
  const [isUnavailable, setIsUnavailable] = useState(service?.is_temporarily_unavailable ?? false);
  const [addons, setAddons] = useState<Addon[]>(service?.addons || []);
  const [subservices, setSubservices] = useState<Subservice[]>(service?.subservices || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      is_active: isActive,
      is_visible_to_customer: isVisible,
      is_temporarily_unavailable: isUnavailable,
      addons,
      subservices,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="serviceName">Service Name</Label>
        <Input
          id="serviceName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Basic Car Wash"
          required
        />
      </div>

      <div className="flex items-center space-x-6">
        <CheckboxRow label="Active" checked={isActive} onChange={setIsActive} id="isActive" />
        <CheckboxRow label="Visible to Customer" checked={isVisible} onChange={setIsVisible} id="isVisible" />
        <CheckboxRow label="Temporarily Unavailable" checked={isUnavailable} onChange={setIsUnavailable} id="isUnavailable" />
      </div>

      <ServiceListSection
        title="Subservices (Optional Parts/Tasks)"
        items={subservices}
        setItems={setSubservices}
        isSubservice
      />
      <ServiceListSection
        title="Addons (Optional Products)"
        items={addons}
        setItems={setAddons}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}

// Reusable Checkbox row
function CheckboxRow({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}

// List section for Addons/Subservices
function ServiceListSection({
  title,
  items,
  setItems,
  isSubservice = false,
}: {
  title: string;
  items: (Addon | Subservice)[];
  setItems: (items: any[]) => void;
  isSubservice?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={isSubservice ? 'Subservice Name' : 'Addon Name'}
            value={item.name}
            onChange={(e) => {
              const updated = [...items];
              updated[i].name = e.target.value;
              setItems(updated);
            }}
          />
          <Input
            type="number"
            placeholder="Price"
            value={item.price}
            onChange={(e) => {
              const updated = [...items];
              updated[i].price = parseFloat(e.target.value) || 0;
              setItems(updated);
            }}
            className="w-28"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setItems([...items, isSubservice ? { name: '', price: 0, is_optional: true } : { name: '', price: 0 }])
        }
      >
        <Plus className="w-4 h-4 mr-2" /> Add {isSubservice ? 'Subservice' : 'Addon'}
      </Button>
    </div>
  );
}
