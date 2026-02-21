"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Patrol, PaginatedResponse } from "@/types";
import {
  History,
  Plus,
  Filter,
  Search,
  Loader2,
  MoreVertical,
  Eye,
  Navigation,
  Shield,
  Clock,
  User,
  Zap,
  Wifi,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import StartPatrolModal from "./components/StartPatrolModal";
import StatCard from "@/components/ui/StatCard";
import Sheet from "@/components/ui/Sheet";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatrol, setSelectedPatrol] = useState<Patrol | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [patrolToDelete, setPatrolToDelete] = useState<Patrol | null>(null);
  const [patrolToEdit, setPatrolToEdit] = useState<Patrol | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | number | null>(
    null,
  );

  // Stats
  const activeCount = patrols.filter((p) => p.status === "ACTIVE").length;
  const completedToday = patrols.filter((p) => p.status === "COMPLETED").length;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const [patrolsRes, usersRes] = await Promise.all([
        api.get<PaginatedResponse<Patrol>>(`/patrols/?${params.toString()}`),
        api.get<any>("/users/"),
      ]);

      setPatrols(patrolsRes.results || []);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes.results || []);
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [searchParams]);

  const handleEndPatrol = async (id: number | string) => {
    try {
      await api.post(`/patrols/${id}/end/`);
      toast.success("Patrol ended");
      fetchData();
      setIsSheetOpen(false);
    } catch (error) {
      toast.error("Failed to end patrol");
    }
  };

  const handleDeletePatrol = async () => {
    if (!patrolToDelete) return;
    try {
      await api.delete(`/patrols/${patrolToDelete.id}/`);
      toast.success("Mission deleted successfully");
      fetchData();
      setIsDeleteDialogOpen(false);
      setPatrolToDelete(null);
    } catch (error) {
      toast.error("Failed to delete mission");
    }
  };

  const handleEditClick = (patrol: Patrol) => {
    setPatrolToEdit(patrol);
    setIsEditModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleDeleteClick = (patrol: Patrol) => {
    setPatrolToDelete(patrol);
    setIsDeleteDialogOpen(true);
    setActionMenuOpen(null);
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/patrols?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "COMPLETED":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "CANCELLED":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getSpeed = (patrol: Patrol) => {
    const config = patrol.patrol_config || {};
    // Try all possible field names for speed limit
    const speed =
      config.speed_limit ??
      config.speedLimit ??
      config.speed ??
      config.max_speed ??
      (patrol as any).speed_limit ??
      60;

    return speed;
  };

  const getOfficerName = (patrol: Patrol) => {
    if (!patrol.officer) return patrol.officer_name || "Unassigned";

    const user = users.find(
      (u: any) =>
        u.id === patrol.officer ||
        u.uuid === patrol.officer ||
        u.email === patrol.officer_name,
    );

    if (user && user.first_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    return patrol.officer_name || "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3 tracking-tight">
            <History className="text-primary" size={28} />
            Patrol Management
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Monitor and coordinate aerial surveillance missions in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          Launch New Mission
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Live Operations"
          value={activeCount.toString()}
          icon={<Zap size={24} />}
          color="emerald"
        />
        <StatCard
          label="Missions Completed"
          value={completedToday.toString()}
          icon={<History size={24} />}
          color="indigo"
        />
        <StatCard
          label="Operational Rate"
          value="99.9%"
          icon={<Shield size={24} />}
          color="blue"
        />
      </div>

      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Drone ID or Officer Name..."
              className="w-full bg-muted/30 border border-border/60 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all font-semibold placeholder:text-muted-foreground/50"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  updateFilters("search", (e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={searchParams.get("status") || ""}
              onChange={(e) => updateFilters("status", e.target.value)}
              className="bg-muted/30 border border-border/60 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-primary/10 text-foreground font-bold appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/60"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Filter size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 py-2">Mission & Drone</th>
                <th className="px-6 py-2">Assigned Officer</th>
                <th className="px-6 py-2">Launch Time</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-right">Directive</th>
                <th className="px-6 py-2 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patrols.map((patrol) => (
                <tr
                  key={patrol.id}
                  className="group bg-card/20 hover:bg-muted/40 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedPatrol(patrol);
                    setIsSheetOpen(true);
                  }}
                >
                  <td className="px-6 py-4 rounded-l-xl border-y border-l border-border/40 group-hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          patrol.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Mission {patrol.drone_id}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Drone ID: {patrol.drone_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-border/40 group-hover:border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-foreground/80">
                        {getOfficerName(patrol)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-border/40 group-hover:border-primary/20">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        {new Date(patrol.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-5 font-medium">
                        {new Date(patrol.start_time).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-border/40 group-hover:border-primary/20">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${getStatusColor(
                        patrol.status,
                      )}`}
                    >
                      {patrol.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-y border-border/40 group-hover:border-primary/20 text-right">
                    <span className="text-sm font-bold text-foreground">
                      {getSpeed(patrol)}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1 font-semibold">
                      km/h
                    </span>
                  </td>
                  <td className="px-6 py-4 rounded-r-xl border-y border-r border-border/40 group-hover:border-primary/20 text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionMenuOpen(
                          actionMenuOpen === patrol.id ? null : patrol.id,
                        );
                      }}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-lg"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {actionMenuOpen === patrol.id && (
                      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in zoom-in duration-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/live-footage?droneId=${patrol.drone_id}`,
                            );
                            setActionMenuOpen(null);
                          }}
                          className={`${patrol.status === "ACTIVE" ? "flex" : "hidden"} w-full px-4 py-2 text-xs font-semibold text-left text-emerald-500 hover:bg-emerald-500/10 items-center gap-2`}
                        >
                          <Wifi size={14} /> View Live Feed
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatrol(patrol);
                            setIsSheetOpen(true);
                            setActionMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-left text-foreground hover:bg-muted flex items-center gap-2"
                        >
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(patrol);
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-left text-foreground hover:bg-muted flex items-center gap-2"
                        >
                          <Zap size={14} className="text-amber-500" /> Edit
                          Patrol
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(patrol);
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold text-left text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Plus size={14} className="rotate-45" /> Delete
                          Mission
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {patrols.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-xl border-2 border-dashed border-border/40">
              <History size={64} className="text-muted-foreground/20 mb-4" />
              <p className="text-foreground font-bold text-lg">
                No missions found
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Try adjusting your filters or launch a new mission.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={
          selectedPatrol ? `Mission Details: ${selectedPatrol.drone_id}` : ""
        }
        side="bottom"
      >
        {selectedPatrol && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Operational Parameters
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                      Speed Directive
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {getSpeed(selectedPatrol)}
                      <span className="text-sm font-semibold text-muted-foreground ml-1">
                        km/h
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">
                      Mission Duration
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedPatrol.end_time
                        ? `${Math.floor(
                            (new Date(selectedPatrol.end_time).getTime() -
                              new Date(selectedPatrol.start_time).getTime()) /
                              60000,
                          )}m`
                        : "Live"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-6 border border-border/40">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Assignment Data
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Commanding Officer
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {getOfficerName(selectedPatrol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Aerial Asset
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {selectedPatrol.drone_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Mission Status
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(
                        selectedPatrol.status,
                      )}`}
                    >
                      {selectedPatrol.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/20 rounded-xl p-6 border border-border/40 h-full">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Restricted Zones & Hazards
                </h3>
                <div className="space-y-3">
                  {selectedPatrol.patrol_config.restricted_zones?.length ? (
                    selectedPatrol.patrol_config.restricted_zones.map(
                      (zone: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500"
                        >
                          <Shield size={16} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {zone}
                          </span>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border/40 rounded-xl">
                      <p className="text-xs text-muted-foreground font-semibold italic">
                        No restricted zones designated
                      </p>
                    </div>
                  )}
                </div>

                {selectedPatrol.status === "ACTIVE" && (
                  <div className="mt-8">
                    <button
                      onClick={() => handleEndPatrol(selectedPatrol.id)}
                      className="w-full bg-destructive text-destructive-foreground py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Zap size={18} />
                      ABORT MISSION IMMEDIATELY
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      <StartPatrolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStarted={fetchData}
      />

      <StartPatrolModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPatrolToEdit(null);
        }}
        onStarted={fetchData}
        editPatrol={patrolToEdit || undefined}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPatrolToDelete(null);
        }}
        onConfirm={handleDeletePatrol}
        title="Delete Mission"
        description="Are you sure you want to delete this mission? This action cannot be undone."
        variant="destructive"
        confirmText="Delete Mission"
      />
    </div>
  );
}
