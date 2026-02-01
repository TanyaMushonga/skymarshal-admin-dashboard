"use client";

import React, { useState } from "react";
import { Detection } from "@/types";
import { Search, Filter, Download, Car, Truck, Bike, Bus } from "lucide-react";

interface DetectionsClientProps {
  initialDetections: Detection[];
}

export default function DetectionsClient({
  initialDetections,
}: DetectionsClientProps) {
  const [detections] = useState<Detection[]>(initialDetections);
  const [searchTerm, setSearchTerm] = useState("");

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "car":
        return <Car size={16} />;
      case "truck":
        return <Truck size={16} />;
      case "motorcycle":
        return <Bike size={16} />;
      case "bus":
        return <Bus size={16} />;
      default:
        return <Car size={16} />;
    }
  };

  const filteredDetections = detections.filter((d) =>
    d.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            AI Detections
          </h1>
          <p className="text-sm text-slate-400">
            Real-time computer vision analysis from active drone streams.
          </p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm transition-all border border-slate-700">
          <Download size={16} /> Export CSV
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
            placeholder="Search license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 sm:flex-none bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>All Vehicles</option>
            <option>Cars</option>
            <option>Trucks</option>
            <option>Buses</option>
          </select>
          <button className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Drone</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">Speed</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDetections.map((detection) => (
                <tr
                  key={detection.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {new Date(detection.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-blue-400">
                    DRN-00{detection.drone}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <span className="p-1.5 bg-slate-800 rounded">
                        {getVehicleIcon(detection.vehicle_type)}
                      </span>
                      <span className="capitalize">
                        {detection.vehicle_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm font-bold text-slate-100 italic tracking-widest">
                      {detection.license_plate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${
                        detection.speed && detection.speed > 60
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {detection.speed} km/h
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        style={{ width: `${detection.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {(detection.confidence * 100).toFixed(1)}% match
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                    {detection.location.coordinates[1].toFixed(4)},{" "}
                    {detection.location.coordinates[0].toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
