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

import { v4 as uuidv4 } from 'uuid';

// Types
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
  duration_minutes?: number;
  is_active: boolean;
  is_visible_to_customer: boolean;
  addon_ids: string;
  subservice_ids: string;
}

interface TaskType {
  _id: string;
  name: string;
}

export default function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    task_type_id: '',
    tags: '',
    duration_minutes: undefined,
    is_active: true,
    is_visible_to_customer: true,
    addon_ids: '',
    subservice_ids: '',
  });

  useEffect(() => {
    loadServices();
    loadTaskTypes();
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

  const loadTaskTypes = async () => {
    try {
      const data = await fetchFromAPI<TaskType[]>('/api/task-types');
      setTaskTypes(data);
    } catch {
      toast.error('Failed to load task types');
    }
  };

  const openForm = (svc?: Service) => {
    if (svc) {
      setFormData({
        name: svc.name,
        task_type_id: svc.task_type_id,
        tags: svc.tags.join(', '),
        duration_minutes: svc.duration_minutes,
        is_active: svc.is_active,
        is_visible_to_customer: svc.is_visible_to_customer,
        addon_ids: svc.addon_ids.join(', '),
        subservice_ids: svc.subservice_ids.join(', '),
      });
      setSelectedServiceId(svc._id);
    } else {
      setFormData({
        name: '',
        task_type_id: '',
        tags: '',
        duration_minutes: undefined,
        is_active: true,
        is_visible_to_customer: true,
        addon_ids: '',
        subservice_ids: '',
      });
      setSelectedServiceId(null);
    }
    setFormOpen(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()),
        addon_ids: formData.addon_ids.split(',').map((id) => id.trim()),
        subservice_ids: formData.subservice_ids.split(',').map((id) => id.trim()),
        duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : undefined,
      };

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
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Services</h2>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                  <Plus className="mr-2 h-4 w-4" /> New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{selectedServiceId ? 'Edit Service' : 'Create Service'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                  <div>
                    <Label>Name</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div>
                    <Label>Task Type</Label>
                    <select
                      name="task_type_id"
                      value={formData.task_type_id}
                      onChange={handleChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select Task Type</option>
                      {taskTypes.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input name="tags" value={formData.tags} onChange={handleChange} />
                  </div>

                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      name="duration_minutes"
                      value={formData.duration_minutes || ''}
                      onChange={handleChange}
                    />
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

                  <div>
                    <Label>Addon IDs (comma separated UUIDs)</Label>
                    <Input name="addon_ids" value={formData.addon_ids} onChange={handleChange} />
                  </div>

                  <div>
                    <Label>Subservice IDs (comma separated UUIDs)</Label>
                    <Input
                      name="subservice_ids"
                      value={formData.subservice_ids}
                      onChange={handleChange}
                    />
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
              {services.map((svc) => (
                <div
                  key={svc._id}
                  className="p-4 border rounded-lg flex justify-between items-center hover:shadow transition"
                >
                  <div>
                    <h4 className="text-lg font-medium">{svc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Duration: {svc.duration_minutes || '-'} mins, Tags: {svc.tags.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openForm(svc)}>
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(svc._id)}
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
