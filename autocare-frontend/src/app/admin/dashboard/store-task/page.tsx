'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { fetchFromAPI } from '@/lib/api';

interface TaskType {
  _id: string;
  name: string;
  allowed_in_hub: boolean;
  allowed_in_garage: boolean;
  slot_type: 'per_hour' | 'max_per_day';
  count: number;
}

export default function StoreTaskPage() {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    allowed_in_hub: false,
    allowed_in_garage: false,
    slot_type: 'per_hour',
    count: 0,
  });

  const fetchTasks = async () => {
    try {
      const data = await fetchFromAPI<TaskType[]>('/api/task-types');
      setTaskTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch task types', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetchFromAPI('/api/task-types', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setFormData({
        name: '',
        allowed_in_hub: false,
        allowed_in_garage: false,
        slot_type: 'per_hour',
        count: 0,
      });
      await fetchTasks(); // refresh list
    } catch (error) {
      console.error('Failed to create task type', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Task Types</h2>

        {/* Task Type Form */}
        <Card className="mb-6 p-4 space-y-4 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-700">Add New Task Type</h3>

          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              placeholder="Eg: Tyre & Wheel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.allowed_in_hub}
                onChange={(e) =>
                  setFormData({ ...formData, allowed_in_hub: e.target.checked })
                }
              />
              <span>Allowed in Hub</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.allowed_in_garage}
                onChange={(e) =>
                  setFormData({ ...formData, allowed_in_garage: e.target.checked })
                }
              />
              <span>Allowed in Garage</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label>Slot Type</Label>
              <select
                value={formData.slot_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slot_type: e.target.value as 'per_hour' | 'max_per_day',
                  })
                }
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option value="per_hour">Per Hour</option>
                <option value="max_per_day">Max Per Day</option>
              </select>
            </div>

            <div className="flex-1">
              <Label>Count</Label>
              <Input
                type="number"
                value={formData.count}
                onChange={(e) =>
                  setFormData({ ...formData, count: parseInt(e.target.value || '0') })
                }
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Task Type'}
          </Button>
        </Card>

        {/* Existing Task Types */}
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {taskTypes.map((task) => (
            <Card key={task._id} className="p-4 bg-white border rounded-md shadow-sm">
              <h4 className="text-md font-semibold text-gray-900">{task.name}</h4>
              <p className="text-sm text-gray-600">Slot: {task.slot_type}</p>
              <p className="text-sm text-gray-600">Count: {task.count}</p>
              <p className="text-xs text-gray-500 mt-2">
                {task.allowed_in_hub && '✅ Hub '}
                {task.allowed_in_garage && '✅ Garage'}
              </p>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
