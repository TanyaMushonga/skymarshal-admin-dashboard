"use client";

import React, { useState, useEffect } from "react";
import { Vehicle, PaginatedResponse, VehicleHistory } from "@/types";
import { Search, Plus, Filter, Loader2, Eye, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import Sheet from "@/components/ui/Sheet";
import RegisterVehicleModal from "./components/RegisterVehicleModal";

interface VehiclesClientProps {
  initialData: PaginatedResponse<Vehicle>;
}

export default function VehiclesClient({ initialData }: VehiclesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>(
    initialData?.results || [],
  );
  const [pagination, setPagination] = useState({
    count: initialData?.count || 0,
    next: initialData?.next,
    previous: initialData?.previous,
  });
  const [loading, setLoading] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] =
    useState<VehicleHistory | null>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await api.get<any>(
        `/vehicle-lookup/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setVehicles(response);
        setPagination({
          count: response.length,
          next: null,
          previous: null,
        });
      } else if (
        response &&
        typeof response === "object" &&
        "results" in response
      ) {
        setVehicles(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get("search") || "";

    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/vehicles?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSuccess = async () => {
    await fetchData();
    router.refresh();
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/vehicles?${params.toString()}`);
  };

  const fetchVehicleHistory = async (uuid: string) => {
    setHistoryLoading(true);
    try {
      const history = await api.get<VehicleHistory>(
        `/vehicle-lookup/${uuid}/history/`,
      );
      setSelectedVehicleHistory(history);
      setIsHistorySheetOpen(true);
    } catch (error) {
      toast.error("Failed to fetch vehicle history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "EXPIRED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "STOLEN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "SUSPENDED":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Vehicle Database
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage registered vehicles, owners, and compliance data.
          </p>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Register Vehicle
        </button>
      </div>

      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by license plate or owner..."
              className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={searchParams.get("status") || ""}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="px-4 py-3 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="STOLEN">Stolen</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-3 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/60"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Filter size={20} />
              )}
            </button>
          </div>
        </div>

        {loading && vehicles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : vehicles.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      License Plate
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Make / Model
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => fetchVehicleHistory(vehicle.id)}
                    >
                      <td className="py-4 px-4">
                        <span className="text-base font-bold text-foreground uppercase tracking-wide">
                          {vehicle.license_plate}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-base font-medium text-foreground">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.color}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-base font-medium text-foreground">
                            {vehicle.owner_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.owner_phone_number}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                            vehicle.status,
                          )}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base text-foreground">
                          {new Date(vehicle.expiry_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchVehicleHistory(vehicle.id);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-semibold"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.count > vehicles.length && (
              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Showing {vehicles.length} of {pagination.count} vehicles
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const page =
                        parseInt(searchParams.get("page") || "1") - 1;
                      updateFilters("page", page.toString());
                    }}
                    disabled={!pagination.previous || loading}
                    className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const page =
                        parseInt(searchParams.get("page") || "1") + 1;
                      updateFilters("page", page.toString());
                    }}
                    disabled={!pagination.next || loading}
                    className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No vehicles found
            </h3>
            <p className="text-base text-muted-foreground">
              Try adjusting your search or register a new vehicle.
            </p>
          </div>
        )}
      </div>

      <Sheet
        isOpen={isHistorySheetOpen}
        onClose={() => setIsHistorySheetOpen(false)}
        title="Vehicle Intelligence"
        side="bottom"
      >
        {historyLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : selectedVehicleHistory ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Detections
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {selectedVehicleHistory.statistics.total_detections}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm font-medium text-muted-foreground">
                      Violation Count
                    </span>
                    <span className="text-base font-bold text-red-500">
                      {selectedVehicleHistory.statistics.total_violations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Outstanding Fines
                    </span>
                    <span className="text-base font-bold text-amber-500">
                      $
                      {selectedVehicleHistory.statistics.total_fines_outstanding.toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Vehicle Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      License Plate
                    </p>
                    <p className="text-base font-bold text-foreground uppercase tracking-wide">
                      {selectedVehicleHistory.vehicle.license_plate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Make / Model
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {selectedVehicleHistory.vehicle.make}{" "}
                      {selectedVehicleHistory.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Owner
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {selectedVehicleHistory.vehicle.owner_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedVehicleHistory.vehicle.owner_phone_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Recent Detections
                </h3>
                <div className="space-y-3">
                  {selectedVehicleHistory.recent_detections.length > 0 ? (
                    selectedVehicleHistory.recent_detections.map(
                      (detection) => (
                        <div
                          key={detection.id}
                          className="p-4 bg-muted/40 rounded-lg border border-border/30"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {new Date(detection.timestamp).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Drone: {detection.drone_id}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {detection.speed} km/h
                            </span>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No recent detections.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  Violations History
                </h3>
                <div className="space-y-3">
                  {selectedVehicleHistory.violations_history.length > 0 ? (
                    selectedVehicleHistory.violations_history.map(
                      (violation) => (
                        <div
                          key={violation.id}
                          className="p-4 bg-muted/40 rounded-lg border border-border/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-bold text-red-500 uppercase tracking-wide">
                                {violation.type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(violation.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-amber-500">
                              ${violation.fine.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-border bg-background">
                              {violation.status}
                            </span>
                            <a
                              href={violation.video_url}
                              target="_blank"
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              View Evidence <ChevronRight size={12} />
                            </a>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No violations recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Sheet>

      <RegisterVehicleModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
