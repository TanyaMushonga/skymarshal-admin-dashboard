"use client";

import React, { useState, useEffect } from "react";
import { Detection } from "@/types";
import {
  Eye,
  Search,
  RefreshCw,
  Car,
  Truck,
  Bike,
  Bus,
  Loader2,
  MapPin,
  Zap,
  Award,
  Hash,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface DetectionsClientProps {
  initialDetections: Detection[];
  initialPagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export default function DetectionsClient({
  initialDetections,
  initialPagination,
}: DetectionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [detections, setDetections] = useState<Detection[]>(initialDetections);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState(
    searchParams.get("vehicle_type") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("ordering") || "-timestamp",
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());

      const response = await api.get<any>(
        `/detections/events/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setDetections(response);
        setPagination({ count: response.length, next: null, previous: null });
      } else if (response && "results" in response) {
        setDetections(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch detections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/detections?${params.toString()}`);
  };

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
      router.push(`/detections?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "car":
        return <Car size={16} className="text-blue-500" />;
      case "truck":
        return <Truck size={16} className="text-orange-500" />;
      case "motorcycle":
        return <Bike size={16} className="text-purple-500" />;
      case "bus":
        return <Bus size={16} className="text-green-500" />;
      case "van":
        return <Car size={16} className="text-cyan-500" />;
      default:
        return <Car size={16} className="text-gray-500" />;
    }
  };

  const getVehicleColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "car":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "truck":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "motorcycle":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "bus":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "van":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Eye className="text-primary" size={28} />
            Detections
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Real-time vehicle detection events from drone surveillance
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-semibold hover:bg-muted/50 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by license plate or track ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </form>
        <select
          value={vehicleTypeFilter}
          onChange={(e) => {
            setVehicleTypeFilter(e.target.value);
            updateFilters("vehicle_type", e.target.value);
          }}
          className="px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="">All Vehicles</option>
          <option value="car">Cars</option>
          <option value="truck">Trucks</option>
          <option value="motorcycle">Motorcycles</option>
          <option value="bus">Buses</option>
          <option value="van">Vans</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            updateFilters("ordering", e.target.value);
          }}
          className="px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="-timestamp">Newest First</option>
          <option value="timestamp">Oldest First</option>
          <option value="-speed">Highest Speed</option>
          <option value="speed">Lowest Speed</option>
        </select>
      </div>

      {/* Detections Table */}
      {loading && detections.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : detections.length > 0 ? (
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Timestamp
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Vehicle
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    License
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Speed
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Track ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Confidence
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {detections.map((detection) => (
                  <tr
                    key={detection.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {new Date(detection.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(detection.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-muted/30 rounded-lg">
                          {getVehicleIcon(detection.vehicle_type)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold border capitalize ${getVehicleColor(detection.vehicle_type)}`}
                        >
                          {detection.vehicle_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {detection.license_plate ? (
                        <span className="px-3 py-1 bg-muted/40 border border-border/60 rounded font-mono text-sm font-bold">
                          {detection.license_plate}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {detection.speed ? (
                        <div className="flex items-center gap-2">
                          <Zap
                            size={14}
                            className={
                              detection.speed > 60
                                ? "text-red-500"
                                : "text-green-500"
                            }
                          />
                          <span
                            className={`text-sm font-bold ${detection.speed > 60 ? "text-red-500" : "text-green-500"}`}
                          >
                            {detection.speed.toFixed(1)} km/h
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {detection.track_id !== null ? (
                        <div className="flex items-center gap-1 text-sm font-mono text-primary">
                          <Hash size={12} />
                          {detection.track_id}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{
                              width: `${detection.confidence * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {(detection.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {detection.location ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <MapPin size={12} className="text-primary" />
                          {detection.location.coordinates[1].toFixed(4)},
                          {detection.location.coordinates[0].toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.count > detections.length && (
            <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
              <p className="text-sm font-medium text-muted-foreground">
                Showing {detections.length} of {pagination.count} detections
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const page = parseInt(searchParams.get("page") || "1") - 1;
                    updateFilters("page", page.toString());
                  }}
                  disabled={!pagination.previous || loading}
                  className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const page = parseInt(searchParams.get("page") || "1") + 1;
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
        </div>
      ) : (
        <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border/50">
          <Eye size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">
            No detections found
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {searchInput || vehicleTypeFilter
              ? "Try adjusting your search or filters"
              : "Detection events will appear here as drones patrol"}
          </p>
        </div>
      )}
    </div>
  );
}
