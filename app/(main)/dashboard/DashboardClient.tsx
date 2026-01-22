"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, History, Eye, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { DashboardMetrics, Violation, Drone } from "@/types";

const CHART_DATA = [
  { time: "08:00", detections: 12, violations: 1 },
  { time: "10:00", detections: 25, violations: 3 },
  { time: "12:00", detections: 45, violations: 8 },
  { time: "14:00", detections: 38, violations: 2 },
  { time: "16:00", detections: 52, violations: 6 },
  { time: "18:00", detections: 30, violations: 4 },
  { time: "20:00", detections: 15, violations: 1 },
];

interface DashboardClientProps {
  initialMetrics: DashboardMetrics;
  initialViolations: Violation[];
  initialIdleDrones: Drone[];
}

export default function DashboardClient({
  initialMetrics,
  initialViolations,
  initialIdleDrones,
}: DashboardClientProps) {
  const router = useRouter();
  const [metrics] = useState<DashboardMetrics>(initialMetrics);
  const [violations] = useState<Violation[]>(initialViolations);
  const [drones] = useState<Drone[]>(initialIdleDrones);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Control Center
          </h1>
          <p className="text-sm text-slate-400">
            Drone fleet and traffic status overview.
          </p>
        </div>
        <button
          onClick={() => setIsDeployModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plane size={18} />
          Deploy New Drone
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Active Drones"
          value={`${metrics.active_drones}/${metrics.total_drones}`}
          icon={<Plane size={24} />}
          trend="+2 online"
          color="blue"
        />
        <StatCard
          label="Active Patrols"
          value={metrics.total_patrols_today}
          icon={<History size={24} />}
          trend="84% coverage"
          color="indigo"
        />
        <StatCard
          label="Today's Detections"
          value={metrics.total_detections_today}
          icon={<Eye size={24} />}
          trend="+12%"
          color="emerald"
        />
        <StatCard
          label="Pending Violations"
          value={metrics.pending_violations}
          icon={<AlertTriangle size={24} />}
          trend="Review needed"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 md:p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-100">
              Detection Volume (24h)
            </h3>
            <select className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none text-slate-200">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#e2e8f0", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorDet)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-800 rounded-xl p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-100">Recent Violations</h3>
            <button
              onClick={() => router.push("/violations")}
              className="text-blue-500 text-sm flex items-center gap-1 hover:underline group"
            >
              All{" "}
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>
          <div className="space-y-4">
            {violations.map((v) => (
              <div
                key={v.id}
                className="flex gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => router.push("/violations")}
              >
                <img
                  src={v.image_snapshot}
                  className="w-14 h-10 md:w-16 md:h-12 object-cover rounded-md flex-shrink-0"
                  alt="evidence"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-100 truncate">
                      {v.plate}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium whitespace-nowrap ml-2">
                      {v.violation_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        title="Deploy New Drone Mission"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setIsDeployModalOpen(false);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Select Drone
            </label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50">
              {drones.length > 0 ? (
                drones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.drone_id})
                  </option>
                ))
              ) : (
                <option disabled>No idle drones available</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Assigned Officer
            </label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50">
              <option>Officer John Doe</option>
              <option>Officer Jane Smith</option>
              <option>Officer Mike Ross</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Speed Limit (km/h)
            </label>
            <input
              type="number"
              defaultValue={60}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              Launch Patrol
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
