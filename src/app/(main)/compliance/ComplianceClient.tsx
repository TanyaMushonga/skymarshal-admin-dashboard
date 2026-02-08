"use client";

import React, { useState } from "react";
import { Lottery, LotteryDrawResult, PaginatedResponse } from "@/types";
import {
  Play,
  Loader2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ComplianceClientProps {
  initialLotteries: Lottery[];
  initialPagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export default function ComplianceClient({
  initialLotteries,
  initialPagination,
}: ComplianceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lotteries, setLotteries] = useState<Lottery[]>(initialLotteries);
  const [loading, setLoading] = useState(false);
  const [drawingLottery, setDrawingLottery] = useState<number | null>(null);
  const [deletingLottery, setDeletingLottery] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingLotteryId, setPendingLotteryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [pagination, setPagination] = useState(
    initialPagination || { count: 0, next: null, previous: null },
  );

  const currentPage = parseInt(searchParams.get("page") || "1");

  const fetchLotteries = async (search?: string, page?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("ordering", "-draw_date");
      if (search) params.set("search", search);
      if (page) params.set("page", page.toString());

      const response = await api.get<PaginatedResponse<Lottery>>(
        `/compliance/lotteries/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setLotteries(response);
        setPagination({ count: response.length, next: null, previous: null });
      } else if (response && "results" in response) {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/compliance?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/compliance?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchLotteries(searchQuery, currentPage);
    router.refresh();
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
      toast.success(`Lottery drawn! ${result.winners_count} winners selected`);
      await fetchLotteries(searchQuery, currentPage);
      router.refresh();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to run lottery draw";
      toast.error(errorMsg);
    } finally {
      setDrawingLottery(null);
      setPendingLotteryId(null);
    }
  };

  const handleDelete = (lotteryId: number) => {
    setPendingLotteryId(lotteryId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingLotteryId) return;

    setDeleteDialogOpen(false);
    setDeletingLottery(pendingLotteryId);

    try {
      await api.delete(`/compliance/lotteries/${pendingLotteryId}/`);
      toast.success("Lottery deleted successfully");
      await fetchLotteries(searchQuery, currentPage);
      router.refresh();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to delete lottery";
      toast.error(errorMsg);
    } finally {
      setDeletingLottery(null);
      setPendingLotteryId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            Open
          </span>
        );
      case "DRAWN":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Drawn
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/30 text-muted-foreground border border-border/60">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount);
  };

  const totalPages = Math.ceil(pagination.count / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Compliance Program
          </h1>
          <p className="text-muted-foreground mt-1">
            Incentivizing safe driving through rewards and compliance points.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search lotteries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Lottery Name
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Draw Date
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Prize Pool
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Min Points
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Loading lotteries...
                    </p>
                  </td>
                </tr>
              ) : lotteries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">No lotteries found</p>
                  </td>
                </tr>
              ) : (
                lotteries.map((lottery) => (
                  <tr
                    key={lottery.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {lottery.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatDate(lottery.draw_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-emerald-500">
                        {formatCurrency(lottery.pool_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {lottery.minimum_points} pts
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lottery.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {lottery.status === "OPEN" && (
                          <button
                            onClick={() => handleRunDraw(lottery.id)}
                            disabled={drawingLottery === lottery.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {drawingLottery === lottery.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Drawing...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Run Draw
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lottery.id)}
                          disabled={deletingLottery === lottery.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-destructive/20"
                          title="Delete lottery"
                        >
                          {deletingLottery === lottery.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({pagination.count} total
            lotteries)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.previous || loading}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.next || loading}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmRunDraw}
        title="Run Lottery Draw"
        description="Are you sure you want to run this lottery draw? This action cannot be undone."
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lottery"
        description="Are you sure you want to delete this lottery? This action cannot be undone and all associated data will be permanently removed."
        variant="destructive"
      />
    </div>
  );
}
