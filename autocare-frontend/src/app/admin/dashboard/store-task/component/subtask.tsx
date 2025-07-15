'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

type Service = {
  _id: string;
  name: string;
  duration_minutes: number;
  is_active: boolean;
  base_price?: number;
};

type Props = {
  taskTypeId?: string;
  taskTypeName?: string;
};

export default function Subtask({ taskTypeId, taskTypeName }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const fetchServices = async () => {
    if (!taskTypeId) return;
    const res = await fetch(`/api/services?task_type_id=${taskTypeId}`);
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchServices();
  }, [taskTypeId]);

  const handleDelete = async (_id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await fetch(`/api/services/${_id}`, { method: 'DELETE' });
    setServices((prev) => prev.filter((s) => s._id !== _id));
  };

  const handleSave = async (data: Partial<Service>) => {
    const method = selected ? 'PUT' : 'POST';
    const url = selected
      ? `/api/services/${selected._id}`
      : `/api/services`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, task_type_id: taskTypeId }),
    });

    const updated = await res.json();
    setShowDialog(false);
    setSelected(null);

    setServices((prev) =>
      selected
        ? prev.map((s) => (s._id === updated._id ? updated : s))
        : [...prev, updated]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>
          {taskTypeName ? `Subservices for ${taskTypeName}` : 'All Subservices'}
        </CardTitle>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelected(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service._id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.duration_minutes} min</TableCell>
                <TableCell>{service.is_active ? '✅' : '❌'}</TableCell>
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
                    onClick={() => handleDelete(service._id)}
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, duration_minutes: duration });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Service Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (mins)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
