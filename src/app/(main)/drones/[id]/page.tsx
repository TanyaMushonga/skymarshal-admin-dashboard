import { server } from "@/lib/server-api";
import { Drone } from "@/types";
import { notFound } from "next/navigation";
import {
  Plane,
  MapPin,
  Battery,
  Wifi,
  Shield,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

import DroneAPIKeyManager from "./components/DroneAPIKeyManager";

export default async function DroneDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let drone: Drone | null = null;
  try {
    drone = await server.get<Drone>(`/drones/${params.id}/`);
  } catch (error) {
    console.error("Failed to fetch drone:", error);
  }

  if (!drone) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/drones"
        className="flex items-center gap-2 text-slate-400 hover:text-slate-100 transition-colors w-fit"
      >
        <ChevronLeft size={16} /> Back to Fleet
      </Link>

      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-600/20">
              <Plane size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {drone.name}
              </h1>
              <p className="text-slate-400">
                {drone.drone_id} • {drone.model}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Battery
              </span>
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Battery
                  size={14}
                  className={
                    drone.status?.battery_level! < 20
                      ? "text-red-500"
                      : "text-emerald-500"
                  }
                />
                {drone.status?.battery_level}%
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Signal
              </span>
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Wifi size={14} className="text-blue-500" />
                {drone.status?.signal_strength}%
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">
                Status
              </span>
              <span
                className={`text-sm font-bold capitalize ${drone.status?.status === "online" ? "text-emerald-500" : "text-slate-500"}`}
              >
                {drone.status?.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">Live Map View for {drone.name}</p>
              <p className="text-xs text-slate-600 mt-2">
                ({drone.latest_location?.latitude},{" "}
                {drone.latest_location?.longitude})
              </p>
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 mb-6">
              Mission Logs
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Patrol Mission #{340 + i}
                      </p>
                      <p className="text-xs text-slate-500">
                        Completed 2 hours ago
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">
                    Success
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 mb-6">
              Hardware Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Serial Number</span>
                <span className="text-sm font-mono text-slate-200">
                  {drone.serial_number}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Assigned Officer</span>
                <span className="text-sm text-slate-200">
                  {drone.assigned_officer_name || "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Created At</span>
                <span className="text-sm text-slate-200">
                  {new Date(drone.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
              <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-colors">
                Edit Configuration
              </button>
            </div>

            <DroneAPIKeyManager
              droneId={drone.drone_id}
              initialKeys={drone.api_keys}
            />

            <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
              <Shield size={18} /> Emergency Access
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Initiate emergency return to home or manual override.
            </p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20">
              Immediate RTH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
