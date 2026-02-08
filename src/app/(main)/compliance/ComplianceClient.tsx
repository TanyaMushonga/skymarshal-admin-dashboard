"use client";

import React, { useState, useEffect } from "react";
import { Lottery, LotteryDrawResult } from "@/types";
import {
  Award,
  Trophy,
  Users,
  Play,
  Loader2,
  RefreshCw,
  DollarSign,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ComplianceClientProps {
  initialLotteries: Lottery[];
}

export default function ComplianceClient({
  initialLotteries,
}: ComplianceClientProps) {
  const router = useRouter();
  const [lotteries, setLotteries] = useState<Lottery[]>(initialLotteries);
  const [loading, setLoading] = useState(false);
  const [drawingLottery, setDrawingLottery] = useState<number | null>(null);
  const [confirmDrawDialog, setConfirmDrawDialog] = useState<{
    isOpen: boolean;
    lotteryId: number | null;
  }>({ isOpen: false, lotteryId: null });

  const fetchLotteries = async () => {
    setLoading(true);
    try {
      const response = await api.get<any>(
        "/compliance/lotteries/?ordering=-draw_date&page_size=10",
      );

      if (Array.isArray(response)) {
        setLotteries(response);
      } else if (response && "results" in response) {
        setLotteries(response.results || []);
      }
    } catch (error) {
      toast.error("Failed to fetch lotteries");
    } finally {
      setLoading(false);
    }
  };

  const handleRunDraw = async () => {
    const lotteryId = confirmDrawDialog.lotteryId;
    if (!lotteryId) return;

    // Find the lottery to get its data
    const lottery = lotteries.find((l) => l.id === lotteryId);
    if (!lottery) return;

    setConfirmDrawDialog({ isOpen: false, lotteryId: null });
    setDrawingLottery(lotteryId);
    try {
      const result = await api.post<LotteryDrawResult>(
        `/compliance/lotteries/${lotteryId}/run_draw/`,
        {
          name: lottery.name,
          draw_date: lottery.draw_date,
          pool_amount: lottery.pool_amount,
          minimum_points: lottery.minimum_points,
          warnings: lottery.warnings || "",
        },
      );
      toast.success(
        `Lottery drawn! ${result.winners_count} winners selected from pool of $${result.pool}`,
      );
      await fetchLotteries();
      router.refresh();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Failed to run lottery draw";
      toast.error(errorMsg);
    } finally {
      setDrawingLottery(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-primary/10 text-primary border-primary/20";
      case "DRAWN":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PAID":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted/30 text-muted-foreground border-border/60";
    }
  };

  // Count active participants (vehicles with points in OPEN lotteries)
  const activeParticipants = lotteries.filter(
    (l) => l.status === "OPEN",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="text-primary" size={28} />
            Compliance Program
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Incentivizing safe driving through rewards and compliance points.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLotteries}
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/40 backdrop-blur-md rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Lotteries
              </p>
              <p className="text-2xl font-bold text-foreground">
                {lotteries.filter((l) => l.status === "OPEN").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card/40 backdrop-blur-md rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <DollarSign className="text-emerald-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Prize Pool
              </p>
              <p className="text-2xl font-bold text-foreground">
                $
                {lotteries
                  .filter((l) => l.status === "OPEN")
                  .reduce((sum, l) => sum + parseFloat(l.pool_amount), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card/40 backdrop-blur-md rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Award className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Draws
              </p>
              <p className="text-2xl font-bold text-foreground">
                {lotteries.filter((l) => l.status !== "OPEN").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lotteries */}
      <div className="bg-card/40 backdrop-blur-md rounded-xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            Lottery Events
          </h3>
          <button
            onClick={() => router.push("/lotteries")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Manage All
          </button>
        </div>

        {loading && lotteries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : lotteries.length > 0 ? (
          <div className="space-y-4">
            {lotteries.slice(0, 5).map((lottery) => (
              <div
                key={lottery.id}
                className="bg-muted/20 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-bold text-foreground">
                        {lottery.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold border ${getStatusBadge(
                          lottery.status,
                        )}`}
                      >
                        {lottery.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(lottery.draw_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <DollarSign size={14} />
                        {parseFloat(lottery.pool_amount).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Award size={14} />
                        Min: {lottery.minimum_points} pts
                      </div>
                    </div>
                    {lottery.winners.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">
                          Winners:
                        </span>
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
                    )}
                  </div>
                  <div className="flex gap-2">
                    {lottery.status === "OPEN" && (
                      <button
                        onClick={() =>
                          setConfirmDrawDialog({
                            isOpen: true,
                            lotteryId: lottery.id,
                          })
                        }
                        disabled={
                          drawingLottery === lottery.id ||
                          parseFloat(lottery.pool_amount) <= 0
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          parseFloat(lottery.pool_amount) <= 0
                            ? "Pool amount must be > 0"
                            : "Run Draw"
                        }
                      >
                        {drawingLottery === lottery.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Play size={16} />
                        )}
                        Run Draw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy
              size={48}
              className="mx-auto text-muted-foreground/30 mb-4"
            />
            <h3 className="text-lg font-bold text-foreground">
              No lotteries available
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create a new lottery to get started
            </p>
            <button
              onClick={() => router.push("/lotteries")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Go to Lottery Management
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <Award size={16} />
          How It Works
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Compliance points are automatically awarded when vehicles are detected
          driving at or below the speed limit. Drivers with sufficient points
          qualify for monthly lottery draws funded by traffic penalties.
        </p>
      </div>

      {/* Confirm Draw Dialog */}
      <ConfirmDialog
        isOpen={confirmDrawDialog.isOpen}
        onClose={() => setConfirmDrawDialog({ isOpen: false, lotteryId: null })}
        onConfirm={handleRunDraw}
        title="Run Lottery Draw"
        description="Are you sure you want to run this lottery draw? This action cannot be undone and will automatically select winners and send SMS notifications."
        confirmText="Run Draw"
        variant="default"
        loading={drawingLottery === confirmDrawDialog.lotteryId}
      />
    </div>
  );
}
