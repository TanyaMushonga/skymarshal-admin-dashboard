"use client";

import React, { useState, useEffect } from "react";
import { Lottery, PaginatedResponse, LotteryDrawResult } from "@/types";
import {
  Trophy,
  Plus,
  Edit,
  Play,
  Loader2,
  Search,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface LotteriesClientProps {
  initialData: PaginatedResponse<Lottery>;
}

export default function LotteriesClient({ initialData }: LotteriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lotteries, setLotteries] = useState<Lottery[]>(
    initialData?.results || [],
  );
  const [pagination, setPagination] = useState({
    count: initialData?.count || 0,
    next: initialData?.next,
    previous: initialData?.previous,
  });
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLottery, setEditingLottery] = useState<Lottery | null>(null);
  const [drawingLottery, setDrawingLottery] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingLotteryId, setPendingLotteryId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.append("ordering", "-draw_date");

      const response = await api.get<any>(
        `/compliance/lotteries/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setLotteries(response);
        setPagination({ count: response.length, next: null, previous: null });
      } else if (
        response &&
        typeof response === "object" &&
        "results" in response
      ) {
        setLotteries(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch lotteries");
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
    router.push(`/lotteries?${params.toString()}`);
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
      router.push(`/lotteries?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRunDraw = (lotteryId: number) => {
    setPendingLotteryId(lotteryId);
    setConfirmDialogOpen(true);
  };

  const confirmRunDraw = async () => {
    if (!pendingLotteryId) return;

    setConfirmDialogOpen(false);
    setDrawingLottery(pendingLotteryId);

    try {
      const result = await api.post<LotteryDrawResult>(
        `/compliance/lotteries/${pendingLotteryId}/run_draw/`,
      );
      toast.success(
        `Lottery drawn! ${result.winners_count} winners selected from pool of $${result.pool}`,
      );
      await fetchData();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to run lottery draw";
      toast.error(errorMsg);
    } finally {
      setDrawingLottery(null);
      setPendingLotteryId(null);
    }
  };

  const handleCreate = async (data: Partial<Lottery>) => {
    try {
      await api.post("/compliance/lotteries/", data);
      toast.success("Lottery created successfully");
      setShowCreateModal(false);
      await fetchData();
      router.refresh();
    } catch (error) {
      toast.error("Failed to create lottery");
    }
  };

  const handleUpdate = async (id: number, data: Partial<Lottery>) => {
    try {
      await api.put(`/compliance/lotteries/${id}/`, data);
      toast.success("Lottery updated successfully");
      setEditingLottery(null);
      await fetchData();
      router.refresh();
    } catch (error) {
      toast.error("Failed to update lottery");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "DRAWN":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PAID":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="text-primary" size={28} />
            Lottery Management
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage safe driving reward lotteries
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
          Create Lottery
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
            placeholder="Search by lottery name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            updateFilters("status", e.target.value);
          }}
          className="px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="DRAWN">Drawn</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Lotteries Table */}
      {loading && lotteries.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : lotteries.length > 0 ? (
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Lottery Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Draw Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Pool Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Min Points
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Winners
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {lotteries.map((lottery) => (
                  <tr
                    key={lottery.id}
                    className="hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-primary" />
                        <span className="text-base font-semibold text-foreground">
                          {lottery.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(lottery.draw_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-base font-bold text-emerald-500">
                        <DollarSign size={16} />
                        {parseFloat(lottery.pool_amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Award size={14} />
                        {lottery.minimum_points}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          lottery.status,
                        )}`}
                      >
                        {lottery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lottery.winners.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lottery.winners.slice(0, 3).map((winner, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                            >
                              {winner}
                            </span>
                          ))}
                          {lottery.winners.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{lottery.winners.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No winners yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {lottery.status === "OPEN" && (
                          <>
                            <button
                              onClick={() => setEditingLottery(lottery)}
                              className="p-2 rounded-lg hover:bg-muted/30 transition-all"
                              title="Edit"
                            >
                              <Edit size={16} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleRunDraw(lottery.id)}
                              disabled={
                                drawingLottery === lottery.id ||
                                parseFloat(lottery.pool_amount) <= 0
                              }
                              className="p-2 rounded-lg hover:bg-emerald-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                parseFloat(lottery.pool_amount) <= 0
                                  ? "Pool amount must be > 0"
                                  : "Run Draw"
                              }
                            >
                              {drawingLottery === lottery.id ? (
                                <Loader2
                                  size={16}
                                  className="text-emerald-500 animate-spin"
                                />
                              ) : (
                                <Play size={16} className="text-emerald-500" />
                              )}
                            </button>
                          </>
                        )}
                        {lottery.status === "DRAWN" && (
                          <CheckCircle size={20} className="text-emerald-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.count > lotteries.length && (
            <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
              <p className="text-sm font-medium text-muted-foreground">
                Showing {lotteries.length} of {pagination.count} lotteries
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
          <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">
            No lotteries found
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first lottery to get started
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLottery) && (
        <LotteryModal
          lottery={editingLottery}
          onClose={() => {
            setShowCreateModal(false);
            setEditingLottery(null);
          }}
          onSave={(data) => {
            if (editingLottery) {
              handleUpdate(editingLottery.id, data);
            } else {
              handleCreate(data);
            }
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
          setPendingLotteryId(null);
        }}
        onConfirm={confirmRunDraw}
        title="Run Lottery Draw"
        description="Are you sure you want to run this lottery draw? This action cannot be undone and winners will be selected immediately."
        confirmText="Run Draw"
        cancelText="Cancel"
        variant="default"
        loading={drawingLottery !== null}
      />
    </div>
  );
}

// Modal Component
function LotteryModal({
  lottery,
  onClose,
  onSave,
}: {
  lottery: Lottery | null;
  onClose: () => void;
  onSave: (data: Partial<Lottery>) => void;
}) {
  const [name, setName] = useState(lottery?.name || "");
  const [drawDate, setDrawDate] = useState(lottery?.draw_date || "");
  const [poolAmount, setPoolAmount] = useState(lottery?.pool_amount || "");
  const [minPoints, setMinPoints] = useState(
    lottery?.minimum_points?.toString() || "10",
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      draw_date: drawDate,
      pool_amount: poolAmount,
      minimum_points: parseInt(minPoints),
    });
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border/50 rounded-xl shadow-2xl z-50 p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {lottery ? "Edit Lottery" : "Create Lottery"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Lottery Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="February Safe Driving Lottery"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Draw Date
            </label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Pool Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={poolAmount}
              onChange={(e) => setPoolAmount(e.target.value)}
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="10000.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Minimum Points
            </label>
            <input
              type="number"
              value={minPoints}
              onChange={(e) => setMinPoints(e.target.value)}
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="10"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border/60 rounded-lg font-semibold hover:bg-muted/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : lottery ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
