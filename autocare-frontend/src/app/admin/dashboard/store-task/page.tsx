'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const [newTask, setNewTask] = useState<Omit<TaskType, '_id'>>({
    name: '',
    allowed_in_hub: false,
    allowed_in_garage: false,
    slot_type: 'per_hour',
    count: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Omit<TaskType, '_id'>>({ ...newTask });

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

  const handleAdd = async () => {
    if (!newTask.name) return;
    setLoading(true);
    try {
      await fetchFromAPI('/api/task-types', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      setNewTask({ name: '', allowed_in_hub: false, allowed_in_garage: false, slot_type: 'per_hour', count: 0 });
      fetchTasks();
    } catch (err) {
      console.error('Failed to add task', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchFromAPI(`/api/task-types/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await fetchFromAPI(`/api/task-types/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(editData),
      });
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      console.error('Edit failed', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Task Types</h2>

        <Card className="p-4 mb-6 overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-2 py-2">Task Name</th>
                <th className="px-2 py-2">Slot Type</th>
                <th className="px-2 py-2">Count</th>
                <th className="px-2 py-2">Hub</th>
                <th className="px-2 py-2">Garage</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Add New Row */}
              <tr className="border-t">
                <td className="px-2 py-2">
                  <Input value={newTask.name} onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} />
                </td>
                <td className="px-2 py-2">
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={newTask.slot_type}
                    onChange={(e) =>
                      setNewTask({ ...newTask, slot_type: e.target.value as 'per_hour' | 'max_per_day' })
                    }
                  >
                    <option value="per_hour">Per Hour</option>
                    <option value="max_per_day">Max Per Day</option>
                  </select>
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    value={newTask.count}
                    onChange={(e) => setNewTask({ ...newTask, count: parseInt(e.target.value || '0') })}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={newTask.allowed_in_hub}
                    onChange={(e) => setNewTask({ ...newTask, allowed_in_hub: e.target.checked })}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={newTask.allowed_in_garage}
                    onChange={(e) => setNewTask({ ...newTask, allowed_in_garage: e.target.checked })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Button onClick={handleAdd} size="sm" disabled={loading}>
                    Add
                  </Button>
                </td>
              </tr>

              {/* Existing Tasks */}
              {taskTypes.map((task) =>
                editingId === task._id ? (
                  <tr key={task._id} className="border-t bg-yellow-50">
                    <td className="px-2 py-2">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={editData.slot_type}
                        onChange={(e) =>
                          setEditData({ ...editData, slot_type: e.target.value as 'per_hour' | 'max_per_day' })
                        }
                      >
                        <option value="per_hour">Per Hour</option>
                        <option value="max_per_day">Max Per Day</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={editData.count}
                        onChange={(e) =>
                          setEditData({ ...editData, count: parseInt(e.target.value || '0') })
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editData.allowed_in_hub}
                        onChange={(e) => setEditData({ ...editData, allowed_in_hub: e.target.checked })}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editData.allowed_in_garage}
                        onChange={(e) => setEditData({ ...editData, allowed_in_garage: e.target.checked })}
                      />
                    </td>
                    <td className="px-2 py-2 flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={task._id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2">{task.name}</td>
                    <td className="px-2 py-2 capitalize">{task.slot_type}</td>
                    <td className="px-2 py-2">{task.count}</td>
                    <td className="px-2 py-2 text-center">{task.allowed_in_hub ? '✅' : ''}</td>
                    <td className="px-2 py-2 text-center">{task.allowed_in_garage ? '✅' : ''}</td>
                    <td className="px-2 py-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(task._id);
                          setEditData({ ...task });
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(task._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
