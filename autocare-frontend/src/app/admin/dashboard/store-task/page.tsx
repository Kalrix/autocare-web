'use client';

import { useState } from 'react';
import AdminSidebar from '@/app/admin/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskTab from './component/task';
import SubtaskTab from './component/subtask';

export default function StoreTaskPage() {
  const [activeTab, setActiveTab] = useState('task');

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
              <SubtaskTab />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
