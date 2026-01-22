"use client";

import React, { useState } from "react";
import { mockApi } from "@/lib/mockApi";
import { Drone } from "@/types";
import {
  MoreVertical,
  Wifi,
  Battery,
  MapPin,
  Plus,
  Plane as PlaneIcon,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Link from "next/link";

interface DronesClientProps {
  initialDrones: Drone[];
}

export default function DronesClient({ initialDrones }: DronesClientProps) {
  const [drones] = useState<Drone[]>(initialDrones);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "maintenance":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Drone Fleet
          </h1>
          <p className="text-sm text-slate-400">
            Manage surveillance hardware and missions.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search ID..."
            className="w-full sm:w-48 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Drone
          </button>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Drone Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Health</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Latest Pos</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {drones.map((drone) => (
                <tr
                  key={drone.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/drones/${drone.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <PlaneIcon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">
                          {drone.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {drone.drone_id} • {drone.model}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          drone.status?.status || "",
                        )}`}
                      ></span>
                      <span className="text-sm font-medium capitalize text-slate-300">
                        {drone.status?.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center gap-1.5"
                        title="Battery"
                      >
                        <Battery
                          size={14}
                          className={
                            drone.status?.battery_level! < 20
                              ? "text-red-500"
                              : "text-slate-400"
                          }
                        />
                        <span className="text-sm text-slate-300">
                          {drone.status?.battery_level}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Signal">
                        <Wifi size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {drone.status?.signal_strength}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300 truncate max-w-[120px]">
                      {drone.assigned_officer_name || "Unassigned"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={14} />
                      <span className="text-[10px] whitespace-nowrap">
                        {drone.latest_location?.latitude.toFixed(4)},{" "}
                        {drone.latest_location?.longitude.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Drone"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Drone ID
            </label>
            <input
              type="text"
              placeholder="e.g., DRN-013"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="e.g., Falcon Two"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Model
              </label>
              <input
                type="text"
                placeholder="e.g., DJI Air 3"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                placeholder="SN-..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              Save Hardware
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
