"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import { fetchFromAPI } from "@/lib/api";

// ---- Types ----
type StoreDetails = {
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  manager_name: string;
  manager_number: string;
  alias: string;
  password: string;
};

type TaskType = {
  id: string;
  name: string;
  slot_type?: string;
};

type TaskCapacity = {
  task_type_id: string;
  capacity: number;
};

type GarageHubTag = {
  hub_id: string;
};

type Store = {
  id: string;
  name: string;
  type: "hub" | "garage";
} & StoreDetails;

// ---- Helper ----
function renderInput(
  label: string,
  name: string,
  value: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  readOnly: boolean = false,
  type: string = "text"
) {
  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <Input name={name} value={value} onChange={onChange} readOnly={readOnly} type={type} />
    </div>
  );
}

export default function EditStorePage() {
  const params = useParams();
  const storeId = params?.id as string;
  const router = useRouter();

  const [storeType, setStoreType] = useState<"hub" | "garage">("hub");
  const [storeName, setStoreName] = useState("");
  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    manager_name: "",
    manager_number: "",
    alias: "",
    password: "",
  });

  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [taskCapacities, setTaskCapacities] = useState<Record<string, number>>({});
  const [hubOptions, setHubOptions] = useState<Store[]>([]);
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      try {
        const store = (await fetchFromAPI(`/api/stores/${storeId}`)) as Store;
        if (!store) throw new Error("Store not found");

        setStoreType(store.type);
        setStoreName(store.name.replace(/^AutoCare24 - /, ""));
        setStoreDetails({
          city: store.city,
          address: store.address,
          latitude: store.latitude,
          longitude: store.longitude,
          manager_name: store.manager_name,
          manager_number: store.manager_number,
          alias: store.alias,
          password: store.password,
        });

        const tasks = (await fetchFromAPI(`/api/task-types?storeType=${store.type}`)) as Partial<TaskType & { _id?: string }>[];
        const normalizedTasks: TaskType[] = tasks.map((t) => ({
          id: t.id ?? t._id ?? "",
          name: t.name ?? "Unnamed Task",
          slot_type: t.slot_type,
        }));
        setTaskTypes(normalizedTasks);

        const capacities = (await fetchFromAPI(`/api/store-task-capacities/${storeId}`)) as TaskCapacity[];
        const capMap: Record<string, number> = {};
        for (const cap of capacities) {
          capMap[cap.task_type_id] = cap.capacity;
        }
        setTaskCapacities(capMap);

        if (store.type === "garage") {
          const hubs = (await fetchFromAPI(`/api/stores?type=hub`)) as Store[];
          setHubOptions(hubs);

          const tags = (await fetchFromAPI(`/api/garage-hub-tags?garage_id=${storeId}`)) as GarageHubTag[];
          setSelectedHubs(tags.map((tag) => tag.hub_id));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load store data.";
        console.error("Failed to load store", err);
        setErrorMessage(message);
      }
    };

    fetchData();
  }, [storeId]);

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStoreName(e.target.value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCapacityChange = (taskId: string, value: string) => {
    setTaskCapacities((prev) => ({
      ...prev,
      [taskId]: parseInt(value || "0", 10),
    }));
  };

  const handleHubToggle = (hubId: string) => {
    setSelectedHubs((prev) =>
      prev.includes(hubId)
        ? prev.filter((id) => id !== hubId)
        : [...prev, hubId]
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...storeDetails,
        name: storeName.startsWith("AutoCare24 -") ? storeName : `AutoCare24 - ${storeName}`,
        type: storeType,
      };

      await fetchFromAPI(`/api/stores/${storeId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const taskPayload = taskTypes.map((t) => ({
        store_id: storeId,
        task_type_id: t.id,
        capacity: taskCapacities[t.id] || 0,
      }));

      await fetchFromAPI("/api/store-task-capacities", {
        method: "PUT",
        body: JSON.stringify(taskPayload),
      });

      if (storeType === "garage") {
        const tagPayload = {
          garage_id: storeId,
          hub_ids: selectedHubs,
        };

        await fetchFromAPI("/api/garage-hub-tags", {
          method: "PUT",
          body: JSON.stringify(tagPayload),
        });
      }

      router.push("/admin/dashboard/manage-store");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update store.";
      console.error("Update failed", err);
      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        {errorMessage && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-300 p-3 rounded-md">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Store Details</TabsTrigger>
                <TabsTrigger value="tasks">Task Capacities</TabsTrigger>
                {storeType === "garage" && <TabsTrigger value="hubs">Tag Hubs</TabsTrigger>}
              </TabsList>

              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput("Store Name", "name", storeName, handleStoreNameChange)}
                  {renderInput("Alias", "alias", storeDetails.alias, undefined, true)}
                  {renderInput("City", "city", storeDetails.city, handleInputChange)}
                  {renderInput("Address", "address", storeDetails.address, handleInputChange)}
                  {renderInput("Latitude", "latitude", storeDetails.latitude, handleInputChange)}
                  {renderInput("Longitude", "longitude", storeDetails.longitude, handleInputChange)}
                  {renderInput("Manager Name", "manager_name", storeDetails.manager_name, handleInputChange)}
                  {renderInput("Manager Number", "manager_number", storeDetails.manager_number, handleInputChange)}
                  {renderInput("Password", "password", storeDetails.password, handleInputChange, false, "password")}

                  <div>
                    <Label className="block mb-1">Type</Label>
                    <select
                      className="w-full border rounded p-2"
                      onChange={(e) => setStoreType(e.target.value as "hub" | "garage")}
                      value={storeType}
                    >
                      <option value="hub">Hub</option>
                      <option value="garage">Garage</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="space-y-4">
                  {taskTypes.map((task, index) => (
                    <div key={task.id ?? `task-${index}`} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                      <Label className="block mb-1">{task.name}</Label>
                      <Input
                        type="number"
                        value={taskCapacities[task.id] || 0}
                        onChange={(e) => handleCapacityChange(task.id, e.target.value)}
                      />
                      <span className="text-sm text-gray-500">{task.slot_type}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {storeType === "garage" && (
                <TabsContent value="hubs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hubOptions.map((hub, index) => (
                      <div key={hub.id ?? `hub-${index}`} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedHubs.includes(hub.id)}
                          onCheckedChange={() => handleHubToggle(hub.id)}
                        />
                        <Label>{hub.name}</Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            <Button className="mt-6 w-full md:w-auto" onClick={handleSubmit}>
              Update Store
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
