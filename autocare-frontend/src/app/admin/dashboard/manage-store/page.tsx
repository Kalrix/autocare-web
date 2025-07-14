"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import { fetchFromAPI } from "@/lib/api";

interface Store {
  id: string;
  name: string;
  city: string;
  type: "hub" | "garage";
  alias: string;
}

export default function ManageStorePage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await fetchFromAPI<Store[]>("/api/stores");
        setStores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(search.toLowerCase()) ||
      store.city.toLowerCase().includes(search.toLowerCase()) ||
      store.alias.toLowerCase().includes(search.toLowerCase());

    const matchesCity = cityFilter
      ? store.city.toLowerCase() === cityFilter.toLowerCase()
      : true;

    return matchesSearch && matchesCity;
  });

  const uniqueCities = Array.from(new Set(stores.map((s) => s.city))).sort();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">All Stores</h2>
          <Button onClick={() => router.push("/admin/dashboard/manage-store/create")}>
            Create Store
          </Button>
        </div>

        <div className="mb-4 flex flex-col md:flex-row gap-4 max-w-2xl">
          <Input
            placeholder="Search by name, city or alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile View */}
        <section className="grid gap-4 md:hidden">
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              onClick={() => router.push(`/admin/dashboard/manage-store/${store.id}`)}
              className={`p-4 cursor-pointer hover:shadow-md transition rounded-md border-l-4 ${
                store.type === "hub" ? "border-blue-500 bg-blue-50" : "border-green-500 bg-green-50"
              }`}
            >
              <h3 className="font-semibold text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-600">{store.city}</p>
              <p className="text-xs text-gray-500 capitalize">
                {store.type} · {store.alias}
              </p>
              <Button size="sm" className="mt-2 w-fit">
                View / Edit
              </Button>
            </Card>
          ))}
        </section>

        {/* Desktop View */}
        <section className="hidden md:block bg-white border rounded-md shadow overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">City</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Alias</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <tr
                  key={store.id}
                  className={`border-t hover:bg-gray-50 ${
                    store.type === "hub" ? "bg-blue-50" : "bg-green-50"
                  }`}
                >
                  <td className="px-4 py-2 font-medium">{store.name}</td>
                  <td className="px-4 py-2">{store.city}</td>
                  <td className="px-4 py-2 capitalize">{store.type}</td>
                  <td className="px-4 py-2">{store.alias}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/dashboard/manage-store/${store.id}`)}
                    >
                      View / Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
