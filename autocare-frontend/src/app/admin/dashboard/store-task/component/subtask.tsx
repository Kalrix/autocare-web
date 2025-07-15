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
  DialogTrigger,
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

// Interfaces (no changes)
interface Addon {
  name: string;
  price: number;
}

interface Subservice {
  name: string;
  description?: string;
  vehicle_category?: string;
  price: number;
  is_optional: boolean;
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
  available_from?: string;
  available_to?: string;
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

  // Centralized function to fetch services
  const refetchServices = () => {
    fetchFromAPI<Service[]>(`/api/services?task_type_id=${taskTypeId}`)
      .then((data) => setServices(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    refetchServices();
  }, [taskTypeId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetchFromAPI(`/api/services/${id}`, { method: 'DELETE' });
      refetchServices(); // Refetch to ensure state is in sync
    } catch (err) {
      console.error('Delete failed:', err);
      // Optionally show an error toast to the user
    }
  };

  const handleSave = async (data: Partial<Service>) => {
    const isEditing = !!selectedService;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/services/${selectedService.id}` : `/api/services`;

    try {
      await fetchFromAPI<Service>(url, {
        method,
        body: JSON.stringify({ ...data, task_type_id: taskTypeId }),
      });
      refetchServices(); // ✅ FIX: Refetch data to get new IDs and ensure sync
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Save failed:', err);
      // Optionally show an error toast to the user
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services for {taskTypeName}</CardTitle>
        <Button
          onClick={() => {
            setSelectedService(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
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
                    <TableCell>{service.duration_minutes ?? 'N/A'} min</TableCell>
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
                        <span className="sr-only">Delete Service</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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
          {/* ✅ FIX: Added DialogHeader, Title, and Description for accessibility */}
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the service. Click save when you're done.
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

// --- Service Form Component ---

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
}) {
  // Use `??` for better default value handling (handles `false` correctly)
  const [name, setName] = useState(service?.name ?? '');
  const [duration, setDuration] = useState(service?.duration_minutes ?? 30);
  const [isActive, setIsActive] = useState(service?.is_active ?? true);
  const [isVisible, setIsVisible] = useState(service?.is_visible_to_customer ?? true);
  const [isUnavailable, setIsUnavailable] = useState(service?.is_temporarily_unavailable ?? false);
  const [addons, setAddons] = useState<Addon[]>(service?.addons || []);
  const [subservices, setSubservices] = useState<Subservice[]>(service?.subservices || []);

  // --- Addon Management ---
  const addAddon = () => setAddons([...addons, { name: '', price: 0 }]);
  const updateAddon = (index: number, key: keyof Addon, value: string | number) => {
    const updated = addons.map((addon, i) =>
      i === index ? { ...addon, [key]: value } : addon
    );
    setAddons(updated);
  };
  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  // --- Subservice Management ---
  const addSubservice = () =>
    setSubservices([...subservices, { name: '', price: 0, is_optional: true }]);
  const updateSubservice = (index: number, key: keyof Subservice, value: string | number) => {
    const updated = subservices.map((sub, i) =>
      i === index ? { ...sub, [key]: value } : sub
    );
    setSubservices(updated);
  };
  const removeSubservice = (index: number) => {
    setSubservices(subservices.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      duration_minutes: duration,
      is_active: isActive,
      is_visible_to_customer: isVisible,
      is_temporarily_unavailable: isUnavailable,
      addons,
      subservices,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service Name"
          required
        />
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Duration (minutes)"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox id="isActive" checked={isActive} onCheckedChange={(c) => setIsActive(!!c)} />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isVisible" checked={isVisible} onCheckedChange={(c) => setIsVisible(!!c)} />
          <Label htmlFor="isVisible">Visible to Customer</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isUnavailable" checked={isUnavailable} onCheckedChange={(c) => setIsUnavailable(!!c)} />
          <Label htmlFor="isUnavailable">Temporarily Unavailable</Label>
        </div>
      </div>

      {/* Addons Section */}
      <div className="space-y-3 rounded-md border p-4">
        <h3 className="text-sm font-medium">Addons</h3>
        {addons.map((addon, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="Addon Name"
              value={addon.name}
              onChange={(e) => updateAddon(i, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={addon.price}
              onChange={(e) => updateAddon(i, 'price', parseFloat(e.target.value) || 0)}
              className="w-28"
            />
            {/* ✨ IMPROVEMENT: Remove button */}
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAddon(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addAddon}>
          <Plus className="w-4 h-4 mr-2" /> Add Addon
        </Button>
      </div>

      {/* Subservices Section */}
      <div className="space-y-3 rounded-md border p-4">
        <h3 className="text-sm font-medium">Subservices</h3>
        {subservices.map((sub, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="Subservice Name"
              value={sub.name}
              onChange={(e) => updateSubservice(i, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={sub.price}
              onChange={(e) => updateSubservice(i, 'price', parseFloat(e.target.value) || 0)}
              className="w-28"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeSubservice(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addSubservice}>
          <Plus className="w-4 h-4 mr-2" /> Add Subservice
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}