'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskTab from './component/task';
import Subtask from './component/subtask';
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
  const [activeTab, setActiveTab] = useState('task');
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskTypes = async () => {
    setLoading(true);
    try {
      const data = await fetchFromAPI<TaskType[]>('/api/task-types');
      setTaskTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch task types', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subtask') {
      fetchTaskTypes();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Store Tasks</h2>

        <Card className="p-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="task">Task Types</TabsTrigger>
              <TabsTrigger value="subtask">Sub Services</TabsTrigger>
            </TabsList>

            <TabsContent value="task">
              <TaskTab />
            </TabsContent>

            <TabsContent value="subtask">
              {loading ? (
                <p className="text-gray-500">Loading task types...</p>
              ) : taskTypes.length === 0 ? (
                <p className="text-gray-500">No task types found.</p>
              ) : (
                taskTypes.map((task) => (
                  <div key={task._id} className="mb-8">
                    <Subtask taskTypeId={task._id} taskTypeName={task.name} />
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
