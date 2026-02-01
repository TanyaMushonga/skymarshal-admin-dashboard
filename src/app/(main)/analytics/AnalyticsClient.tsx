"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  Download,
  TrendingUp,
  AlertCircle,
  Car,
  Clock,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";

const VIOLATION_TYPE_DATA = [
  { name: "Speeding", value: 45 },
  { name: "Red Light", value: 25 },
  { name: "Illegal Turn", value: 15 },
  { name: "Wrong Way", value: 10 },
  { name: "Other", value: 5 },
];

const VEHICLE_TYPE_DATA = [
  { name: "Cars", value: 65 },
  { name: "Trucks", value: 20 },
  { name: "Motorcycles", value: 10 },
  { name: "Buses", value: 5 },
];

const DAILY_ACTIVITY_DATA = [
  { day: "Mon", detections: 240, violations: 24 },
  { day: "Tue", detections: 300, violations: 28 },
  { day: "Wed", detections: 200, violations: 18 },
  { day: "Thu", detections: 450, violations: 42 },
  { day: "Fri", detections: 500, violations: 55 },
  { day: "Sat", detections: 350, violations: 30 },
  { day: "Sun", detections: 150, violations: 12 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsClient() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Advanced Analytics
          </h1>
          <p className="text-sm text-slate-400">
            Traffic insights and mission metrics.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-300">
            <Calendar size={14} className="mr-2" /> Last 7 Days
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Avg Detections/Hr"
          value="42.5"
          icon={<TrendingUp size={24} />}
          trend="+5%"
        />
        <StatCard
          label="Violation Rate"
          value="8.2%"
          icon={<AlertCircle size={24} />}
          trend="-1.2%"
          color="emerald"
        />
        <StatCard
          label="Peak Hour"
          value="17:00"
          icon={<Clock size={24} />}
          color="amber"
        />
        <StatCard
          label="Unique Plates"
          value="2,450"
          icon={<Car size={24} />}
          trend="+124 today"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Detection vs
            Violations
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_ACTIVITY_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#3b82f6"
                  fill="#3b82f620"
                />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stroke="#ef4444"
                  fill="#ef444420"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" /> Violations by
            Type
          </h3>
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VIOLATION_TYPE_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-6">
            Vehicle Distribution
          </h3>
          <div className="h-56 md:h-64 flex flex-col md:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_TYPE_DATA}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {VEHICLE_TYPE_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-2 w-full md:w-auto md:min-w-[120px]">
              {VEHICLE_TYPE_DATA.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-[10px] text-slate-400">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-200">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 mb-4">
            Traffic Density Heatmap
          </h3>
          <div className="bg-slate-900/50 rounded-xl aspect-video flex items-center justify-center border border-slate-800">
            <div className="text-center p-4">
              <TrendingUp size={24} className="text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Geo-Heatmap requires detailed map view
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
