'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchFromAPI } from '@/lib/api';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  task_type_id: string;
  tags: string[];
  duration_minutes?: number;
  is_active: boolean;
  is_visible_to_customer: boolean;
  addon_ids: string[];
  subservice_ids: string[];
  created_at: string;
}

interface ServiceFormData {
  name: string;
  task_type_id: string;
  tags: string;
  duration_unit: 'minutes' | 'hours' | 'days';
  duration_value: number;
  is_active: boolean;
  is_visible_to_customer: boolean;
  addon_ids: string[];
  subservice_ids: string[];
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    task_type_id: '',
    tags: '',
    duration_unit: 'minutes',
    duration_value: 0,
    is_active: true,
    is_visible_to_customer: true,
    addon_ids: [],
    subservice_ids: [],
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchFromAPI<Service[]>('/api/services');
      setServices(data);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (service?: Service) => {
    if (service) {
      setFormData({
        name: service.name,
        task_type_id: service.task_type_id,
        tags: service.tags.join(', '),
        duration_unit: 'minutes',
        duration_value: service.duration_minutes || 0,
        is_active: service.is_active,
        is_visible_to_customer: service.is_visible_to_customer,
        addon_ids: service.addon_ids,
        subservice_ids: service.subservice_ids,
      });
      setSelectedServiceId(service._id);
    } else {
      setFormData({
        name: '',
        task_type_id: '',
        tags: '',
        duration_unit: 'minutes',
        duration_value: 0,
        is_active: true,
        is_visible_to_customer: true,
        addon_ids: [],
        subservice_ids: [],
      });
      setSelectedServiceId(null);
    }
    setFormOpen(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || name === 'duration_value' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const duration_minutes =
      formData.duration_unit === 'minutes'
        ? formData.duration_value
        : formData.duration_unit === 'hours'
        ? formData.duration_value * 60
        : formData.duration_value * 60 * 24;

    const payload = {
      name: formData.name,
      task_type_id: formData.task_type_id,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      duration_minutes,
      is_active: formData.is_active,
      is_visible_to_customer: formData.is_visible_to_customer,
      addon_ids: formData.addon_ids,
      subservice_ids: formData.subservice_ids,
    };

    try {
      const url = selectedServiceId ? `/api/services/${selectedServiceId}` : '/api/services';
      const method = selectedServiceId ? 'PATCH' : 'POST';

      await fetchFromAPI(url, {
        method,
        body: JSON.stringify(payload),
      });

      toast.success(selectedServiceId ? 'Service updated' : 'Service created');
      setFormOpen(false);
      await loadServices();
    } catch {
      toast.error('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await fetchFromAPI(`/api/services/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully');
      await loadServices();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Services</h2>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                  <Plus className="mr-2 h-4 w-4" /> New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedServiceId ? 'Edit Service' : 'Create Service'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label>Task Type ID</Label>
                    <Input
                      name="task_type_id"
                      value={formData.task_type_id}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration Value</Label>
                      <Input
                        name="duration_value"
                        type="number"
                        value={formData.duration_value}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <select
                        name="duration_unit"
                        value={formData.duration_unit}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Visible to Customer</Label>
                      <Switch
                        checked={formData.is_visible_to_customer}
                        onCheckedChange={(val) =>
                          setFormData((prev) => ({ ...prev, is_visible_to_customer: val }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Active</Label>
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(val) =>
                          setFormData((prev) => ({ ...prev, is_active: val }))
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                    {selectedServiceId ? 'Update' : 'Create'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center pt-20">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="p-4 border rounded-lg flex justify-between items-center hover:shadow transition"
                >
                  <div>
                    <h4 className="text-lg font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Tags: {service.tags.join(', ')} | Duration: {service.duration_minutes} mins
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openForm(service)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(service._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
