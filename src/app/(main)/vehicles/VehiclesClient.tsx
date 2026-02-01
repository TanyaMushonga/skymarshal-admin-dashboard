"use client";

import React, { useState } from "react";
import { Vehicle } from "@/types";
import { Search, Car, Award, Calendar, Phone, Filter } from "lucide-react";

interface VehiclesClientProps {
  initialVehicles: Vehicle[];
}

export default function VehiclesClient({
  initialVehicles,
}: VehiclesClientProps) {
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "EXPIRED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "STOLEN":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "SUSPENDED":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">
            Vehicle Database
          </h1>
          <p className="text-slate-400 text-sm">
            Manage registered vehicles, owners, and compliance scores.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
          <Car size={18} /> Register Vehicle
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/40 backdrop-blur-md p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search license plate or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-blue-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Car size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">
                    {vehicle.license_plate}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {vehicle.make} {vehicle.model} • {vehicle.color}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-[10px] font-bold border ${getStatusBadge(
                  vehicle.status,
                )}`}
              >
                {vehicle.status}
              </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                  {vehicle.owner_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 font-bold">
                    {vehicle.owner_name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone size={10} /> {vehicle.owner_phone_number}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-tighter">
                    Compliance
                  </p>
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-blue-400" />
                    <span className="text-sm font-bold text-slate-200">
                      {vehicle.compliance_points} pts
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-tighter">
                    Expiry
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-300">
                      {vehicle.expiry_date}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-xl font-bold transition-colors border border-slate-700 uppercase tracking-widest">
              Violation History
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
