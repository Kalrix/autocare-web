'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
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

type TaskType = {
  id: string;
  name: string;
  allowed_in_hub: boolean;
  allowed_in_garage: boolean;
  slot_type: 'per_hour' | 'max_per_day';
  count: number;
  created_at: string;
};

type TaskTypeFormData = {
  name: string;
  allowed_in_hub: boolean;
  allowed_in_garage: boolean;
  slot_type: 'per_hour' | 'max_per_day';
  count: number;
};

export default function TaskTypeList() {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<TaskTypeFormData>({
    name: '',
    allowed_in_hub: false,
    allowed_in_garage: false,
    slot_type: 'max_per_day',
    count: 0,
  });

  useEffect(() => {
    loadTaskTypes();
  }, []);

  const loadTaskTypes = async () => {
    setLoading(true);
    try {
      const data = await fetchFromAPI<TaskType[]>('/api/task-types');
      setTaskTypes(data);
    } catch {
      toast.error('Failed to load task types');
    } finally {
      setLoading(false);
    }
  };

  const openForm = (task?: TaskType) => {
    if (task) {
      setFormData({
        name: task.name,
        allowed_in_hub: task.allowed_in_hub,
        allowed_in_garage: task.allowed_in_garage,
        slot_type: task.slot_type,
        count: task.count,
      });
      setSelectedTask(task);
    } else {
      setFormData({
        name: '',
        allowed_in_hub: false,
        allowed_in_garage: false,
        slot_type: 'max_per_day',
        count: 0,
      });
      setSelectedTask(null);
    }
    setFormOpen(true);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = selectedTask ? 'PATCH' : 'POST';
      const url = selectedTask
        ? `/api/task-types/${selectedTask.id}`
        : '/api/task-types';

      await fetchFromAPI(url, {
        method,
        body: JSON.stringify(formData),
      });

      toast.success(
        selectedTask ? 'Task type updated' : 'Task type created'
      );
      setFormOpen(false);
      await loadTaskTypes();
    } catch {
      toast.error('Failed to save task type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task type?')) return;

    try {
      await fetchFromAPI(`/api/task-types/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully');
      await loadTaskTypes();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Types</h2>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTask ? 'Edit Task Type' : 'Create Task Type'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Allowed in Hub</Label>
                  <Switch
                    checked={formData.allowed_in_hub}
                    onCheckedChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowed_in_hub: val,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Allowed in Garage</Label>
                  <Switch
                    checked={formData.allowed_in_garage}
                    onCheckedChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowed_in_garage: val,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Slot Type</Label>
                <select
                  name="slot_type"
                  value={formData.slot_type}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="max_per_day">Max Per Day</option>
                  <option value="per_hour">Per Hour</option>
                </select>
              </div>
              <div>
                <Label>Count</Label>
                <Input
                  type="number"
                  name="count"
                  value={formData.count}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                {selectedTask ? 'Update' : 'Create'}
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
          {taskTypes.map((task) => (
            <div
              key={task.id}
              className="p-4 border rounded-lg flex justify-between items-center hover:shadow transition"
            >
              <div>
                <h4 className="text-lg font-medium">{task.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {task.allowed_in_hub && 'Hub'}
                  {task.allowed_in_hub && task.allowed_in_garage && ' + '}
                  {task.allowed_in_garage && 'Garage'} — {task.slot_type},{' '}
                  {task.count}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openForm(task)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
