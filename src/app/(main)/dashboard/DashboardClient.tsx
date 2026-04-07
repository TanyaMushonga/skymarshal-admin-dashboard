"use client";

import React, { useState, useEffect } from "react";
import {
  DashboardOverview,
  TrafficMetrics,
  TrafficPattern,
  AnalyticsReport,
  OfficerStats,
  PaginatedResponse,
} from "@/types";
import {
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Map,
  FileText,
  User,
  Download,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

import StatCard from "@/components/ui/StatCard";

interface DashboardClientProps {
  initialData: DashboardOverview | null;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardOverview | null>(initialData);
  const [metrics, setMetrics] = useState<TrafficMetrics[]>([]);
  const [patterns, setPatterns] = useState<TrafficPattern[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [officerStats, setOfficerStats] = useState<OfficerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "metrics" | "patterns" | "reports" | "officer"
  >("overview");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardOverview>(
        "/analytics/admin/dashboard/",
      );
      setData(response);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await api.get<PaginatedResponse<TrafficMetrics>>(
        "/analytics/admin/metrics/?page_size=20",
      );
      setMetrics(response.results || []);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  const fetchPatterns = async () => {
    try {
      const response = await api.get<PaginatedResponse<TrafficPattern>>(
        "/analytics/admin/patterns/?page_size=10",
      );
      setPatterns(response.results || []);
    } catch (error) {
      console.error("Failed to fetch patterns:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get<PaginatedResponse<AnalyticsReport>>(
        "/analytics/admin/reports/?page_size=10",
      );
      setReports(response.results || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const fetchOfficerStats = async () => {
    try {
      const response = await api.get<OfficerStats>(
        "/analytics/officer/my_stats/",
      );
      setOfficerStats(response);
    } catch (error) {
      console.error("Failed to fetch officer stats:", error);
    }
  };

  const runInference = async () => {
    setLoading(true);
    try {
      await api.post("/analytics/admin/run_inference/");
      toast.success("Inference engine triggered successfully");
      await fetchDashboardData();
    } catch (error) {
      toast.error("Failed to run inference engine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchPatterns();
    fetchReports();
    fetchOfficerStats();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      if (activeTab === "metrics") fetchMetrics();
      if (activeTab === "patterns") fetchPatterns();
      if (activeTab === "reports") fetchReports();
      if (activeTab === "officer") fetchOfficerStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "WARNING":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "ERROR":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-500 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "ALLOCATION":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "SAFETY":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "MAINTENANCE":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "POLICY":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-emerald-500";
    if (score >= 0.7) return "text-amber-500";
    return "text-slate-500";
  };

  const getPatternTypeBadge = (type: string) => {
    switch (type) {
      case "peak_hour":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "congestion":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "accident_prone":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity
            className="animate-spin text-primary mx-auto mb-4"
            size={48}
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live system analytics and AI-powered mission insights
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card/30 p-1.5 rounded-xl border border-border/40 backdrop-blur-md">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-all flex items-center gap-2 font-bold text-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            REFRESH
          </button>
          <button
            onClick={runInference}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 font-bold text-xs"
          >
            <Zap size={14} />
            RUN INFERENCE
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Violations Today"
          value={data.metrics.violations_today}
          icon={<AlertTriangle size={20} />}
          trend={data.metrics.violations_today > 50 ? "+12%" : "Normal"}
          color={data.metrics.violations_today > 50 ? "destructive" : "amber"}
        />
        <StatCard
          label="Active Patrols"
          value={data.metrics.active_patrols}
          icon={<Shield size={20} />}
          trend="Stable"
          color="blue"
        />
        <StatCard
          label="Avg Compliance"
          value={`${Math.round(data.metrics.avg_compliance_score)}%`}
          icon={<CheckCircle size={20} />}
          trend={`${data.metrics.avg_compliance_score.toFixed(1)}%`}
          color="emerald"
        />
        <StatCard
          label="System Status"
          value={
            data.metrics.system_status === "OPERATIONAL"
              ? "Healthy"
              : data.metrics.system_status
          }
          icon={<Activity size={20} />}
          color={
            data.metrics.system_status === "OPERATIONAL"
              ? "emerald"
              : data.metrics.system_status === "WARNING"
                ? "amber"
                : "destructive"
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Analytics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Tabs Header */}
            <div className="flex p-1 bg-muted/20 border-b border-border/50 overflow-x-auto scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: Activity },
                { id: "metrics", label: "Metrics", icon: BarChart3 },
                { id: "patterns", label: "Patterns", icon: Map },
                { id: "reports", label: "Reports", icon: FileText },
                { id: "officer", label: "My Stats", icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all rounded-xl ${
                    activeTab === tab.id
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Mission Summary
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      All systems are currently performing within expected
                      parameters. Fleet coverage is optimal across active zones.
                      Detections are being processed in real-time with an average
                      latency of 145ms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-1">
                        Recent Activity
                      </p>
                      <p className="text-sm font-semibold">
                        Zone Alpha: Speed violation detected
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mb-1">
                        Next Patrol
                      </p>
                      <p className="text-sm font-semibold">
                        Starting in 14 minutes: Zone Delta
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metrics Tab Content */}
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  {metrics.length > 0 ? (
                    <div className="grid gap-3">
                      {metrics.slice(0, 8).map((metric) => (
                        <div
                          key={metric.id}
                          className="bg-muted/10 border border-border/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                Drone
                              </p>
                              <p className="text-sm font-bold text-primary">
                                {metric.drone_id}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                Time
                              </p>
                              <p className="text-sm font-bold">
                                {new Date(metric.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                Vehicles
                              </p>
                              <p className="text-lg font-black leading-none">
                                {metric.vehicle_count}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                Violations
                              </p>
                              <p className="text-lg font-black leading-none text-destructive">
                                {metric.violation_count}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground italic">
                        Processing telemetry data...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Patterns Tab Content */}
              {activeTab === "patterns" && (
                <div className="space-y-4">
                  {patterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="bg-muted/10 border border-border/20 rounded-xl p-5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">
                            {pattern.location_name}
                          </h4>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                            {pattern.pattern_type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary leading-none">
                            {Math.round(pattern.confidence_score * 100)}%
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            Confidence
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pattern.recommendations}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reports Tab Content */}
              {activeTab === "reports" && (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="group bg-muted/10 border border-border/20 hover:bg-muted/20 rounded-xl p-5 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">
                            {report.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {report.start_date} - {report.end_date}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {report.pdf_file && (
                            <a
                              href={report.pdf_file}
                              className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all"
                            >
                              <Download size={14} />
                            </a>
                          )}
                          {report.excel_file && (
                            <a
                              href={report.excel_file}
                              className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
                            >
                              <FileText size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Officer Stats Tab Content */}
              {activeTab === "officer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {officerStats && (
                    <>
                      <div className="p-6 rounded-2xl bg-muted/10 border border-border/20">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                          Session Performance
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-5xl font-black leading-none">
                            {officerStats.performance_rating.toFixed(1)}
                          </p>
                          <p className="text-lg font-bold text-muted-foreground mb-1">
                            / 5.0
                          </p>
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl bg-muted/10 border border-border/20">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                          Patrol Hours
                        </p>
                        <p className="text-5xl font-black leading-none text-primary">
                          {officerStats.hours_patrolled_this_week.toFixed(0)}h
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-linear-to-br from-primary/10 to-indigo-500/5 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                    <Zap className="text-primary-foreground" size={16} />
                  </div>
                  <h3 className="font-extrabold text-lg tracking-tight">
                    AI Insights
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-primary text-primary-foreground rounded-full">
                  {data.recommendations.filter((r) => r.is_active).length} ACTIVE
                </span>
              </div>

              {data.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {data.recommendations
                    .filter((r) => r.is_active)
                    .slice(0, 3)
                    .map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl bg-card/60 border border-border/40 space-y-3 group/item hover:border-primary/50 transition-all cursor-default"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-bold bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded uppercase">
                            {rec.category}
                          </span>
                          <span
                            className={`text-xs font-black ${getConfidenceColor(rec.confidence_score)}`}
                          >
                            {Math.round(rec.confidence_score * 100)}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold group-hover/item:text-primary transition-colors">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                  <Activity size={32} className="mb-2 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Analyzing fleet data...
                  </p>
                </div>
              )}

              <button className="w-full mt-6 py-2 rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 transition-all">
                View All Recommendations
              </button>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
            <h3 className="font-extrabold text-lg tracking-tight mb-4">
              Zone Status
            </h3>
            <div className="space-y-4">
              {[
                { name: "Downtown Core", load: 85, status: "Busy" },
                { name: "North Port", load: 24, status: "Clear" },
                { name: "West Highway", load: 62, status: "Stable" },
              ].map((zone) => (
                <div key={zone.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{zone.name}</span>
                    <span
                      className={
                        zone.load > 80 ? "text-destructive" : "text-emerald-500"
                      }
                    >
                      {zone.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        zone.load > 80 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${zone.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
