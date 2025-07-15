'use client';

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
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState, ChangeEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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
  const [selected, setSelected] = useState<Service | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetch(`/api/services?task_type_id=${taskTypeId}`)
      .then((res) => res.json())
      .then(setServices);
  }, [taskTypeId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async (data: Partial<Service>) => {
    const method = selected ? 'PUT' : 'POST';
    const url = selected ? `/api/services/${selected.id}` : `/api/services`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, task_type_id: taskTypeId }),
    });

    const updated = await res.json();
    setShowDialog(false);
    setSelected(null);

    setServices((prev) =>
      selected ? prev.map((s) => (s.id === updated.id ? updated : s)) : [...prev, updated]
    );
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Services under {taskTypeName}</CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelected(null)}>
              <Plus className="w-4 h-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ServiceForm
              service={selected}
              onSave={handleSave}
              onCancel={() => setShowDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Unavailable</TableHead>
              <TableHead>Subservices</TableHead>
              <TableHead>Addons</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.duration_minutes} min</TableCell>
                <TableCell>{service.is_active ? '✅' : '❌'}</TableCell>
                <TableCell>{service.is_visible_to_customer ? 'Yes' : 'No'}</TableCell>
                <TableCell>{service.is_temporarily_unavailable ? 'Yes' : 'No'}</TableCell>
                <TableCell>{service.subservices.length}</TableCell>
                <TableCell>{service.addons.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelected(service);
                      setShowDialog(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service?.name || '');
  const [duration, setDuration] = useState(service?.duration_minutes || 30);
  const [isActive, setIsActive] = useState(service?.is_active || false);
  const [isVisible, setIsVisible] = useState(service?.is_visible_to_customer || true);
  const [isUnavailable, setIsUnavailable] = useState(service?.is_temporarily_unavailable || false);
  const [addons, setAddons] = useState<Addon[]>(service?.addons || []);
  const [subservices, setSubservices] = useState<Subservice[]>(service?.subservices || []);

  const addAddon = () => setAddons([...addons, { name: '', price: 0 }]);
  const updateAddon = (index: number, key: keyof Addon, value: string | number) => {
    const updated = [...addons];
    updated[index][key] = value as never;
    setAddons(updated);
  };

  const addSubservice = () =>
    setSubservices([
      ...subservices,
      { name: '', price: 0, is_optional: true },
    ]);
  const updateSub = (index: number, key: keyof Subservice, value: string | number | boolean) => {
    const updated = [...subservices];
    updated[index][key] = value as never;
    setSubservices(updated);
  };

  return (
    <form
      onSubmit={(e) => {
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
      }}
      className="space-y-4"
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service Name" required />
      <Input
        type="number"
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        placeholder="Duration (minutes)"
      />
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} /> Visible
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isUnavailable} onChange={(e) => setIsUnavailable(e.target.checked)} /> Unavailable
        </label>
      </div>
      <div>
        <label className="text-sm font-medium">Addons</label>
        {addons.map((addon, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              placeholder="Addon Name"
              value={addon.name}
              onChange={(e) => updateAddon(i, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={addon.price}
              onChange={(e) => updateAddon(i, 'price', parseFloat(e.target.value))}
            />
          </div>
        ))}
        <Button type="button" size="sm" onClick={addAddon} className="mt-1">
          + Add Addon
        </Button>
      </div>
      <div>
        <label className="text-sm font-medium">Subservices</label>
        {subservices.map((sub, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 mb-2">
            <Input
              placeholder="Subservice Name"
              value={sub.name}
              onChange={(e) => updateSub(i, 'name', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={sub.price}
              onChange={(e) => updateSub(i, 'price', parseFloat(e.target.value))}
            />
          </div>
        ))}
        <Button type="button" size="sm" onClick={addSubservice} className="mt-1">
          + Add Subservice
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
