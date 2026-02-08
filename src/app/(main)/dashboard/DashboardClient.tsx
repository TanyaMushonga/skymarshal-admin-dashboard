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
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Real-time analytics and AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-muted/30 text-foreground hover:bg-muted/50 transition-all border border-border/60 flex items-center gap-2 font-semibold text-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={runInference}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/30 flex items-center gap-2 font-semibold text-sm"
          >
            <Activity size={16} />
            Run Inference
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 overflow-x-auto">
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
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="text-red-500" size={24} />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    data.metrics.violations_today > 50
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  }`}
                >
                  {data.metrics.violations_today > 50 ? "High" : "Normal"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Violations Today
              </h3>
              <p className="text-4xl font-bold text-foreground mt-2">
                {data.metrics.violations_today}
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Shield className="text-blue-500" size={24} />
                <TrendingUp className="text-emerald-500" size={20} />
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Active Patrols
              </h3>
              <p className="text-4xl font-bold text-foreground mt-2">
                {data.metrics.active_patrols}
              </p>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-500" size={24} />
                <span className="text-xs font-bold text-muted-foreground">
                  {data.metrics.avg_compliance_score.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Avg Compliance
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-4xl font-bold text-foreground">
                  {Math.round(data.metrics.avg_compliance_score)}
                </p>
                <span className="text-2xl text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <Activity className="text-primary" size={24} />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    data.metrics.system_status,
                  )}`}
                >
                  {data.metrics.system_status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                System Status
              </h3>
              <p className="text-2xl font-bold text-foreground mt-2">
                {data.metrics.system_status === "OPERATIONAL"
                  ? "All Systems Go"
                  : data.metrics.system_status === "WARNING"
                    ? "Minor Issues"
                    : "Critical Error"}
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-foreground">
                  AI Recommendations
                </h2>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {data.recommendations.filter((r) => r.is_active).length} active
              </span>
            </div>

            {data.recommendations.length > 0 ? (
              <div className="space-y-4">
                {data.recommendations
                  .filter((r) => r.is_active)
                  .sort((a, b) => b.confidence_score - a.confidence_score)
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className={`bg-muted/20 border rounded-lg p-4 ${
                        rec.confidence_score >= 0.9
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-bold text-foreground">
                              {rec.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadge(
                                rec.category,
                              )}`}
                            >
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {rec.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Created:{" "}
                              {new Date(rec.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-3xl font-bold ${getConfidenceColor(
                              rec.confidence_score,
                            )}`}
                          >
                            {Math.round(rec.confidence_score * 100)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active recommendations</p>
                <p className="text-xs mt-1">
                  Run the inference engine to generate new insights
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && (
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Traffic Metrics
          </h2>
          {metrics.length > 0 ? (
            <div className="space-y-4">
              {metrics.slice(0, 10).map((metric) => (
                <div
                  key={metric.id}
                  className="bg-muted/20 border border-border/30 rounded-lg p-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Timestamp
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {new Date(metric.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Drone ID
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {metric.drone_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Vehicle Count
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {metric.vehicle_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Speed
                      </p>
                      <p className="text-2xl font-bold text-blue-500">
                        {metric.average_speed.toFixed(1)} km/h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Violations
                      </p>
                      <p className="text-lg font-bold text-red-500">
                        {metric.violation_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cars</p>
                      <p className="text-lg font-bold text-foreground">
                        {metric.car_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Trucks
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {metric.truck_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Max Speed
                      </p>
                      <p className="text-lg font-bold text-amber-500">
                        {metric.max_speed.toFixed(1)} km/h
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No metrics data available
            </p>
          )}
        </div>
      )}

      {/* Patterns Tab */}
      {activeTab === "patterns" && (
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Traffic Patterns
          </h2>
          {patterns.length > 0 ? (
            <div className="space-y-4">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="bg-muted/20 border border-border/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {pattern.location_name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getPatternTypeBadge(
                          pattern.pattern_type,
                        )}`}
                      >
                        {pattern.pattern_type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round(pattern.confidence_score * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Hours</p>
                      <p className="text-sm font-bold text-foreground">
                        {pattern.start_hour}:00 - {pattern.end_hour}:00
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Avg Vehicles
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {pattern.avg_vehicle_count.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Speed</p>
                      <p className="text-sm font-bold text-foreground">
                        {pattern.avg_speed.toFixed(1)} km/h
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Violation Rate
                      </p>
                      <p className="text-sm font-bold text-red-500">
                        {(pattern.violation_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pattern.recommendations}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No patterns detected
            </p>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Analytics Reports
          </h2>
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-muted/20 border border-border/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {report.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {report.start_date} to {report.end_date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.summary}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ml-4 ${
                        report.report_type === "weekly"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : report.report_type === "monthly"
                            ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}
                    >
                      {report.report_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {report.pdf_file && (
                      <a
                        href={report.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all"
                      >
                        <Download size={12} />
                        PDF
                      </a>
                    )}
                    {report.excel_file && (
                      <a
                        href={report.excel_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                      >
                        <Download size={12} />
                        Excel
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No reports available
            </p>
          )}
        </div>
      )}

      {/* Officer Stats Tab */}
      {activeTab === "officer" && (
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            My Performance Stats
          </h2>
          {officerStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-muted/20 border border-border/30 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Officer
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {officerStats.officer}
                </p>
              </div>
              <div className="bg-muted/20 border border-border/30 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Hours Patrolled
                </h3>
                <p className="text-4xl font-bold text-blue-500">
                  {officerStats.hours_patrolled_this_week.toFixed(1)}
                </p>
              </div>
              <div className="bg-muted/20 border border-border/30 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Violations Issued
                </h3>
                <p className="text-4xl font-bold text-amber-500">
                  {officerStats.violations_issued}
                </p>
              </div>
              <div className="bg-muted/20 border border-border/30 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Performance Rating
                </h3>
                <p className="text-4xl font-bold text-emerald-500">
                  {officerStats.performance_rating.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="bg-muted/20 border border-border/30 rounded-lg p-6 md:col-span-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assigned Zone Risk Level
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {officerStats.assigned_zone_risk_level}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No stats available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
