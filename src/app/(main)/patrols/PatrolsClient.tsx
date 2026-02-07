"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Patrol, PaginatedResponse } from "@/types";
import { History, Plus, Filter, Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import PatrolListItem from "./components/PatrolListItem";
import StartPatrolModal from "./components/StartPatrolModal";
import StatCard from "@/components/ui/StatCard";

interface PatrolsClientProps {
  initialData: PaginatedResponse<Patrol>;
  currentPage: number;
}

export default function PatrolsClient({
  initialData,
  currentPage,
}: PatrolsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patrols, setPatrols] = useState<Patrol[]>(initialData.results);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats
  const activeCount = patrols.filter((p) => p.status === "ACTIVE").length;
  const completedToday = patrols.filter((p) => p.status === "COMPLETED").length; // This is a bit naive but fine for UI display of current set

  const refreshData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const response = await api.get<PaginatedResponse<Patrol>>(
        `/patrols/?${params.toString()}`,
      );
      setPatrols(response.results || []);
    } catch (error) {
      toast.error("Failed to refresh patrols");
    } finally {
      setLoading(false);
    }
  };

  const handleEndPatrol = async (id: number) => {
    try {
      await api.post(`/patrols/${id}/end/`);
      toast.success("Patrol ended");
      refreshData();
    } catch (error) {
      toast.error("Failed to end patrol");
    }
  };

  const handleUpdateConfig = (id: number) => {
    // For now, let's just show a toast, or we could open another modal
    toast.info("Config update coming soon");
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/patrols?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <History className="text-primary" />
            Patrol Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your aerial surveillance missions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
        >
          <Plus
            size={20}
            className="group-hover:rotate-90 transition-transform"
          />
          Start New Patrol
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Active Patrols"
          value={activeCount.toString()}
          icon={<History size={24} />}
          color="emerald"
        />
        <StatCard
          label="Completed Missions"
          value={completedToday.toString()}
          icon={<Plus size={24} />}
          color="indigo"
        />
        <StatCard
          label="Total System Uptime"
          value="99.9%"
          icon={<Filter size={24} />}
          color="blue"
        />
      </div>

      <div className="bg-card/30 backdrop-blur-md border border-border rounded-2xl p-4 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Drone ID or Officer..."
              className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  updateFilters("search", (e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={searchParams.get("status") || ""}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-bold"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="w-px h-8 bg-border hidden sm:block mx-1" />
            <button
              onClick={() => refreshData()}
              disabled={loading}
              className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Filter size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {patrols.length > 0 ? (
            patrols.map((patrol) => (
              <PatrolListItem
                key={patrol.id || `${patrol.drone_id}-${patrol.start_time}`}
                patrol={patrol}
                onEnd={handleEndPatrol}
                onUpdateConfig={handleUpdateConfig}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border/50">
              <History size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-foreground font-bold">No patrols found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adjust your filters or start a new mission.
              </p>
            </div>
          )}
        </div>

        {initialData.count > 10 && (
          <div className="mt-8 flex justify-center gap-2">
            {/* Pagination controls */}
          </div>
        )}
      </div>

      <StartPatrolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStarted={refreshData}
      />
    </div>
  );
}
