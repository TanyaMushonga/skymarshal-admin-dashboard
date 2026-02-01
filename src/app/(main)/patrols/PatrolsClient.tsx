"use client";

import React, { useState } from "react";
import { Patrol } from "@/types";
import { MoreVertical, Shield, Clock, MapPin, Search } from "lucide-react";

interface PatrolsClientProps {
  initialPatrols: Patrol[];
}

export default function PatrolsClient({ initialPatrols }: PatrolsClientProps) {
  const [patrols] = useState<Patrol[]>(initialPatrols);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "SCHEDULED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Mission Patrols
          </h1>
          <p className="text-sm text-slate-400">
            Monitor and manage active surveillance missions.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
            Schedule Patrol
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/40 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search mission ID or drone..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 sm:flex-none bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Scheduled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patrols.map((patrol) => (
          <div
            key={patrol.id}
            className="bg-slate-800/40 backdrop-blur-md rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-slate-100 font-bold text-sm">
                    {patrol.patrol_id}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Drone: {patrol.drone_name}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                  patrol.status,
                )}`}
              >
                {patrol.status}
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={14} className="text-red-500/60" />
                <span className="truncate">{patrol.address_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span>Duration</span>
                </div>
                <span className="text-slate-200 font-medium">32m 14s</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{patrol.status === "ACTIVE" ? "65%" : "100%"}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      patrol.status === "ACTIVE"
                        ? "bg-blue-500"
                        : "bg-slate-500"
                    }`}
                    style={{
                      width: patrol.status === "ACTIVE" ? "65%" : "100%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
              <button className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-colors">
                Details
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
