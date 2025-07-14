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

function renderInput(label, name, value, onChange, readOnly = false, type = "text") {
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

  const [storeType, setStoreType] = useState("hub");
  const [storeName, setStoreName] = useState("");
  const [storeDetails, setStoreDetails] = useState({
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    manager_name: "",
    manager_number: "",
    alias: "",
    password: "",
  });
  const [taskTypes, setTaskTypes] = useState([]);
  const [taskCapacities, setTaskCapacities] = useState({});
  const [hubOptions, setHubOptions] = useState([]);
  const [selectedHubs, setSelectedHubs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      try {
        const store = await fetchFromAPI(`/api/stores/${storeId}`);
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

        const tasks = await fetchFromAPI(`/api/task-types?storeType=${store.type}`);
        const normalizedTasks = tasks.map((t) => ({ ...t, id: t.id || t._id }));
        setTaskTypes(normalizedTasks);

        const capacities = await fetchFromAPI(`/api/store-task-capacities/${storeId}`);
        const capMap = {};
        for (const cap of capacities) {
          capMap[cap.task_type_id] = cap.capacity;
        }
        setTaskCapacities(capMap);

        if (store.type === "garage") {
          const hubs = await fetchFromAPI(`/api/stores?type=hub`);
          setHubOptions(hubs);

          const tags = await fetchFromAPI(`/api/garage-hub-tags?garage_id=${storeId}`);
          setSelectedHubs(tags.map((t) => t.hub_id));
        }
      } catch (err) {
        console.error("Failed to load store", err);
        setErrorMessage(err.message);
      }
    };

    fetchData();
  }, [storeId]);

  const handleStoreNameChange = (e) => setStoreName(e.target.value);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoreDetails((prev) => ({ ...prev, [name]: value }));
  };
  const handleCapacityChange = (taskId, value) => {
    setTaskCapacities((prev) => ({ ...prev, [taskId]: parseInt(value || "0", 10) }));
  };
  const handleHubToggle = (hubId) => {
    setSelectedHubs((prev) =>
      prev.includes(hubId) ? prev.filter((id) => id !== hubId) : [...prev, hubId]
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
      console.error("Update failed", err);
      setErrorMessage(err.message);
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
                      onChange={(e) => setStoreType(e.target.value)}
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
