"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Drone, User, PaginatedResponse } from "@/types";
import {
  MoreVertical,
  Wifi,
  Battery,
  MapPin,
  Plus,
  Plane as PlaneIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Save,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Sheet from "@/components/ui/Sheet";

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
}

interface DronesClientProps {
  initialData: PaginatedResponse<Drone>;
  currentPage: number;
}

export default function DronesClient({
  initialData,
  currentPage,
}: DronesClientProps) {
  const [drones, setDrones] = useState<Drone[]>(initialData.results || []);
  const [officers, setOfficers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status__status: searchParams.get("status__status") || "",
    model: searchParams.get("model") || "",
    is_active: searchParams.get("is_active") || "",
  });

  const [debouncedSearch] = useDebounce(filters.search, 500);

  // Sheet & Selected Drone State
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Drone>>({});

  // Sync drones with server props on navigation
  useEffect(() => {
    if (initialData?.results) {
      setDrones(initialData.results);
    }
  }, [initialData]);

  // Update URL on filter change (debounced for search)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Handle Search
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    // Handle other filters
    if (filters.status__status) {
      params.set("status__status", filters.status__status);
    } else {
      params.delete("status__status");
    }

    if (filters.model) {
      params.set("model", filters.model);
    } else {
      params.delete("model");
    }

    if (filters.is_active) {
      params.set("is_active", filters.is_active);
    } else {
      params.delete("is_active");
    }

    // Reset to page 1 on filter change
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`);
  }, [
    debouncedSearch,
    filters.status__status,
    filters.model,
    filters.is_active,
    pathname,
    router,
  ]);

  // Add Form State
  const [formData, setFormData] = useState({
    drone_id: "",
    name: "",
    model: "",
    serial_number: "",
    assigned_officer: "" as string | number,
    is_active: true,
  });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await api.get<User[]>("/users/");
      const officerList = Array.isArray(response)
        ? response.filter((u) => u.is_officer)
        : [];
      setOfficers(officerList);
    } catch (error) {
      console.error("Failed to fetch officers:", error);
      toast.error("Could not load officers list.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        assigned_officer: formData.assigned_officer
          ? Number(formData.assigned_officer)
          : null,
      };

      const response = await api.post<Drone>("/drones/", payload);
      setDrones((prev) => [response, ...prev]);
      setIsAddModalOpen(false);
      toast.success("Drone registered successfully");
      setFormData({
        drone_id: "",
        name: "",
        model: "",
        serial_number: "",
        assigned_officer: "",
        is_active: true,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to create drone:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRowClick = (drone: Drone) => {
    setSelectedDrone(drone);
    setEditFormData(drone);
    setIsEditing(false); // Reset editing state
    setIsSheetOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDrone = async () => {
    if (!selectedDrone) return;
    setLoading(true);
    try {
      const payload = {
        ...editFormData,
        assigned_officer: editFormData.assigned_officer
          ? Number(editFormData.assigned_officer)
          : null,
      };

      const updatedDrone = await api.patch<Drone>(
        `/drones/${selectedDrone.drone_id}/`,
        payload,
      );

      // Update list
      setDrones((prev) =>
        prev.map((d) => (d.drone_id === updatedDrone.drone_id ? updatedDrone : d)),
      );

      // Update selected
      setSelectedDrone(updatedDrone);
      setIsEditing(false);
      toast.success("Drone updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update drone");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrone = async () => {
    if (!selectedDrone) return;
    if (
      !confirm(
        "Are you sure you want to delete this drone? This action cannot be undone.",
      )
    )
      return;

    setLoading(true);
    try {
      await api.delete(`/drones/${selectedDrone.drone_id}/`);
      setDrones((prev) => prev.filter((d) => d.drone_id !== selectedDrone.drone_id));
      setIsSheetOpen(false);
      toast.success("Drone deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete drone");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "maintenance":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Drone Fleet
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage surveillance hardware and missions.
          </p>
        </div>

        {/* Actions & Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-end sm:items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                name="status__status"
                value={filters.status__status}
                onChange={handleFilterChange}
                className="w-full sm:w-40 appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
                <option value="returning">Returning</option>
              </select>
              <Filter
                className="absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none"
                size={14}
              />
            </div>

            {/* Active Filter */}
            <select
              name="is_active"
              value={filters.is_active}
              onChange={handleFilterChange}
              className="w-full sm:w-32 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Active</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search */}
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search name, ID..."
              className="w-full sm:w-48 bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Drone
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md rounded-xl overflow-hidden border border-border">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Drone Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Health</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Latest Pos</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drones.map((drone) => (
                <tr
                  key={drone.id}
                  onClick={() => handleRowClick(drone)}
                  className="hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <PlaneIcon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {drone.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {drone.drone_id} • {drone.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          drone.status?.status || "",
                        )}`}
                      ></span>
                      <span className="text-sm font-medium capitalize text-muted-foreground">
                        {drone.status?.status || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5"
                        title="Battery"
                      >
                        <Battery
                          size={14}
                          className={
                            (drone.status?.battery_level || 0) < 20
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {drone.status?.battery_level || 0}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Signal">
                        <Wifi size={14} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {drone.status?.signal_strength || 0}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                      {drone.assigned_officer_name || "Unassigned"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin size={14} />
                      <span className="text-[10px] whitespace-nowrap">
                        {drone.latest_location?.latitude.toFixed(4) || "0.0000"}
                        ,{" "}
                        {drone.latest_location?.longitude.toFixed(4) ||
                          "0.0000"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {drones.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No drones found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Showing <span className="text-foreground">{drones.length}</span> of{" "}
            <span className="text-foreground">{initialData.count}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!initialData.previous}
              className="p-1 px-3 rounded-md bg-background border border-border text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!initialData.next}
              className="p-1 px-3 rounded-md bg-background border border-border text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition flex items-center gap-1 text-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* View/Edit Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={isEditing ? "Edit Drone" : "Drone Details"}
      >
        {selectedDrone && (
          <div className="space-y-6">
            {/* Header / ID */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border text-center">
              <PlaneIcon size={48} className="mx-auto text-primary mb-2" />
              <h3 className="text-lg font-bold text-foreground">
                {selectedDrone.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDrone.drone_id}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-border">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    selectedDrone.status?.status || "",
                  )}`}
                ></div>
                <span className="text-xs font-medium capitalize text-muted-foreground">
                  {selectedDrone.status?.status || "Unknown"}
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    value={editFormData.name || ""}
                    onChange={handleEditChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Model
                  </label>
                  <input
                    name="model"
                    value={editFormData.model || ""}
                    onChange={handleEditChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Serial Number
                  </label>
                  <input
                    name="serial_number"
                    value={editFormData.serial_number || ""}
                    onChange={handleEditChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Assigned Officer
                  </label>
                  <select
                    name="assigned_officer"
                    value={editFormData.assigned_officer || ""}
                    onChange={handleEditChange}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Unassigned</option>
                    {officers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.first_name} {officer.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateDrone}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground font-bold py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedDrone.model}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Serial Num
                    </p>
                    <p
                      className="text-sm font-semibold text-foreground truncate"
                      title={selectedDrone.serial_number}
                    >
                      {selectedDrone.serial_number}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Battery
                    </p>
                    <div className="flex items-center gap-2">
                      <Battery
                        size={14}
                        className={
                          selectedDrone.status?.battery_level &&
                          selectedDrone.status.battery_level < 20
                            ? "text-destructive"
                            : "text-emerald-500"
                        }
                      />
                      <p className="text-sm font-semibold text-foreground">
                        {selectedDrone.status?.battery_level || 0}%
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Officer
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedDrone.assigned_officer_name || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handleDeleteDrone}
                    className="w-full border border-destructive/20 text-destructive hover:bg-destructive/10 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Drone
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Add Modal - Kept as is */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Drone"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Drone ID
            </label>
            <input
              type="text"
              name="drone_id"
              value={formData.drone_id}
              onChange={handleInputChange}
              required
              placeholder="e.g., DRN-013"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Falcon Two"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="e.g., DJI Air 3"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                required
                placeholder="SN-..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Assigned Officer
            </label>
            <select
              name="assigned_officer"
              value={formData.assigned_officer}
              onChange={handleInputChange}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Unassigned</option>
              {officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.first_name} {officer.last_name} (
                  {officer.force_number || officer.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              {loading ? "Saving..." : "Save Hardware"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
