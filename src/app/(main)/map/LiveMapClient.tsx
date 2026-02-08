"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Patrol, Violation } from "@/types";
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Activity,
  ChevronDown,
  ChevronUp,
  Battery,
  AlertTriangle,
  Clock,
  Target,
  Shield,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import Sheet from "@/components/ui/Sheet";

export default function LiveMapClient() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const { data: session } = useSession();
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [selectedPatrolId, setSelectedPatrolId] = useState<
    string | number | null
  >(null);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [detailPatrol, setDetailPatrol] = useState<Patrol | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);
  const markersRef = useRef<Map<string | number, any>>(new Map());
  const pathsRef = useRef<any[]>([]);

  // Function to format flight duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Load Leaflet Script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);

    const fetchData = async () => {
      try {
        const response = await api.get<any>("/patrols/?status=ACTIVE");
        // Handle both plain array and paginated response
        const data = Array.isArray(response)
          ? response
          : response.results || [];
        setPatrols(data);
      } catch (error) {
        console.error("Failed to fetch active patrols:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds

    function initMap() {
      if (mapContainerRef.current && !mapRef.current) {
        // @ts-ignore
        const L = window.L;
        if (!L) return;

        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([-17.8292, 31.0522], 13);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
          },
        ).addTo(mapRef.current);
      }
    }

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !mapRef.current) return;

    // Clear existing paths
    pathsRef.current.forEach((p) => p.remove());
    pathsRef.current = [];

    // Tracks markers to keep or remove
    const currentPatrolIds = new Set(patrols.map((p) => p.id));

    // Remove markers for patrols that are no longer active
    markersRef.current.forEach((marker, id) => {
      if (!currentPatrolIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    patrols.forEach((patrol) => {
      // 1. Flight Paths (if available)
      if (
        patrol.patrol_config?.flight_path &&
        patrol.patrol_config.flight_path.length > 0
      ) {
        const polyline = L.polyline(
          patrol.patrol_config.flight_path.map((coord: any) => [
            coord[1],
            coord[0],
          ]),
          {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.4,
            dashArray: "10, 10",
          },
        ).addTo(mapRef.current);
        pathsRef.current.push(polyline);
      }

      // 2. Drone Markers
      if (patrol.latest_location) {
        const { latitude, longitude, altitude } = patrol.latest_location;
        const isOnline = patrol.status_display === "online";
        const battery = patrol.battery_level || 0;

        let marker = markersRef.current.get(patrol.id);

        if (!marker) {
          marker = L.circleMarker([latitude, longitude], {
            radius: 12,
            fillColor: isOnline ? "#10b981" : "#ef4444",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(mapRef.current);
          markersRef.current.set(patrol.id, marker);
        } else {
          marker.setLatLng([latitude, longitude]);
          marker.setStyle({
            fillColor: isOnline ? "#10b981" : "#ef4444",
          });
        }

        const batteryColor =
          battery > 50
            ? "bg-emerald-500"
            : battery > 20
              ? "bg-amber-500"
              : "bg-red-500";

        const popupContent = `
          <div class="p-0 text-slate-100 bg-slate-950 rounded-2xl min-w-[240px] border border-white/10 shadow-2xl overflow-hidden">
            <div class="p-4 bg-linear-to-br from-slate-900 to-slate-950 border-b border-white/5">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-black text-sm tracking-tight">${patrol.drone_id}</h4>
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                   <div class="w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}"></div>
                   <span class="text-[9px] font-black uppercase text-slate-400">${patrol.status_display || "OFFLINE"}</span>
                </div>
              </div>
              <p class="text-[10px] text-slate-500 font-medium">Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</p>
            </div>
            
            <div class="p-4 space-y-4">
              <!-- Health Stats -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-end">
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
                    Battery Health
                  </span>
                  <span class="text-xs font-bold text-slate-200">${battery}%</span>
                </div>
                <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full ${batteryColor} transition-all duration-1000" style="width: ${battery}%"></div>
                </div>
              </div>

              <!-- Mission Stats -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p class="text-[8px] font-black text-slate-500 uppercase mb-0.5">Detections</p>
                  <p class="text-lg font-black text-blue-400 leading-none">${patrol.detection_count || 0}</p>
                </div>
                <div class="bg-white/5 p-2 rounded-xl border border-white/5">
                  <p class="text-[8px] font-black text-slate-500 uppercase mb-0.5">Violations</p>
                  <p class="text-lg font-black text-red-400 leading-none">${patrol.violation_count || 0}</p>
                </div>
              </div>

              <div class="pt-2 border-t border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span class="text-[10px] font-bold text-slate-300 font-mono">${formatDuration(patrol.flight_duration_seconds || 0)}</span>
                </div>
                <span class="text-[9px] font-medium text-slate-500">Alt: ${altitude}m</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "custom-leaflet-popup",
          closeButton: false,
          minWidth: 240,
        });

        // If this is the selected patrol, open its popup
        if (selectedPatrolId === patrol.id) {
          marker.openPopup();
        }

        // Add click listener to marker for details
        marker.off("click");
        marker.on("click", () => {
          handleSelectPatrol(patrol);
        });
      }
    });
  }, [patrols, selectedPatrolId]);

  const handleSelectPatrol = async (patrol: Patrol) => {
    setSelectedPatrolId(patrol.id);
    setDetailPatrol(patrol);
    setIsDetailSheetOpen(true);

    if (patrol.latest_location) {
      mapRef.current?.setView(
        [patrol.latest_location.latitude, patrol.latest_location.longitude],
        16,
        { animate: true },
      );
    }

    // Fetch violations for this patrol
    setIsLoadingViolations(true);
    try {
      const response = await api.get<any>(`/violations/?patrol=${patrol.id}`);
      const data = Array.isArray(response) ? response : response.results || [];
      setViolations(data);
    } catch (error) {
      console.error("Failed to fetch violations for patrol:", error);
      setViolations([]);
    } finally {
      setIsLoadingViolations(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      <div className="absolute top-4 right-4 z-1000 flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 bg-slate-900/60 backdrop-blur-md rounded-lg text-slate-300 hover:text-white transition-all shadow-xl"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 bg-slate-900/60 backdrop-blur-md rounded-lg text-slate-300 hover:text-white transition-all shadow-xl"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-1000 bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 md:p-5 min-w-[180px] md:min-w-[260px] shadow-2xl border border-white/10 hidden sm:block">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs md:text-sm font-bold text-slate-100 flex items-center gap-2">
            <Navigation size={14} className="text-blue-500" /> Active Patrols
          </h3>
        </div>
        <div className="space-y-2 md:space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {patrols.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${selectedPatrolId === p.id ? "bg-primary/10 border-primary/30" : "hover:bg-white/5 border-transparent"}`}
              onClick={() => handleSelectPatrol(p)}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span
                    className={`block w-2.5 h-2.5 rounded-full ${
                      p.status_display === "online"
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {p.status_display === "online" && (
                    <span className="absolute -inset-1 bg-emerald-500/20 rounded-full animate-ping opacity-75"></span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-slate-100 uppercase tracking-tight">
                    {p.drone_id}
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium">
                    {p.officer_name?.split("@")[0] || "Unassigned"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-300">
                  {p.battery_level}%
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <Target size={8} className="text-blue-400" />
                  <span className="text-[8px] text-slate-500 font-black">
                    {p.detection_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {patrols.length === 0 && (
            <div className="py-8 text-center">
              <Activity
                size={24}
                className="mx-auto text-slate-700 mb-2 opacity-20"
              />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                No Active Missions
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`
        absolute top-4 left-4 md:top-6 md:left-6 z-1000 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 transition-all duration-300
        ${isFeedExpanded ? "w-64 md:w-72 h-[300px]" : "w-auto md:w-auto h-auto"}
      `}
      >
        <div
          className="flex items-center justify-between p-3 border-b border-white/5 cursor-pointer"
          onClick={() => setIsFeedExpanded(!isFeedExpanded)}
        >
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> Logs
          </h3>
          {isFeedExpanded ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </div>

        {isFeedExpanded && (
          <div className="p-3 space-y-3 overflow-y-auto max-h-[250px] scrollbar-none">
            <div className="flex gap-2 border-l border-blue-500 pl-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-200">
                  Eagle One Active
                </p>
                <p className="text-[9px] text-slate-500">Sector: Downtown</p>
              </div>
            </div>
            <div className="flex gap-2 border-l border-red-500 pl-3">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-red-400">
                  Speed Alert
                </p>
                <p className="text-[9px] text-slate-500">Vehicle: ABC-1234</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Sheet
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        title="Mission Details"
        width="max-w-md"
      >
        {detailPatrol && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black tracking-tighter text-blue-400">
                  {detailPatrol.drone_id}
                </span>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${detailPatrol.status_display === "online" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                >
                  {detailPatrol.status_display || "OFFLINE"}
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-widest">
                <Shield size={12} className="text-indigo-500" />
                Officer:{" "}
                {detailPatrol.officer_name?.split("@")[0] || "Unassigned"}
              </p>
            </div>

            {/* Live Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-slate-500">
                  <Battery size={16} />
                  <span className="text-[10px] font-black uppercase">
                    Energy
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-100">
                    {detailPatrol.battery_level}%
                  </p>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${(detailPatrol.battery_level || 0) > 20 ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${detailPatrol.battery_level}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-slate-500">
                  <Clock size={16} />
                  <span className="text-[10px] font-black uppercase">
                    Duration
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-100 font-mono">
                  {formatDuration(detailPatrol.flight_duration_seconds || 0)}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-slate-500">
                  <MapPin size={16} />
                  <span className="text-[10px] font-black uppercase">
                    Altitude
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-100">
                  {detailPatrol.latest_location?.altitude || 0}
                  <span className="text-xs ml-1 text-slate-500">m</span>
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-slate-500">
                  <Target size={16} />
                  <span className="text-[10px] font-black uppercase">
                    Detections
                  </span>
                </div>
                <p className="text-2xl font-black text-blue-400">
                  {detailPatrol.detection_count || 0}
                </p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Navigation size={12} className="rotate-45" /> Current
                Coordinates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">
                    Latitude
                  </p>
                  <p className="text-xs font-bold text-slate-200 font-mono">
                    {detailPatrol.latest_location?.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-0.5">
                    Longitude
                  </p>
                  <p className="text-xs font-bold text-slate-200 font-mono">
                    {detailPatrol.latest_location?.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Violations Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={12} className="text-red-500" />{" "}
                  Violations Detected
                </h3>
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                  {detailPatrol.violation_count || 0}
                </span>
              </div>

              <div className="space-y-2">
                {isLoadingViolations ? (
                  <div className="py-12 text-center text-slate-500 boarding-border rounded-2xl animate-pulse bg-white/5">
                    <Shield size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Scanning Records...
                    </p>
                  </div>
                ) : violations.length > 0 ? (
                  violations.map((v) => (
                    <div
                      key={v.id}
                      className="group bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-100 uppercase tracking-tight mb-1">
                            {v.violation_type}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                            <span>Fine: {v.fine_amount}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <span
                              className={
                                v.status === "NEW"
                                  ? "text-blue-400"
                                  : "text-slate-400"
                              }
                            >
                              {v.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-950 rounded-lg group-hover:bg-primary transition-colors">
                          <ExternalLink
                            size={12}
                            className="text-slate-400 group-hover:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-700 bg-white/5 rounded-2xl border border-white/5">
                    <Shield size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      No Violations Found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>

      <style>{`
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip { background: #0f172a !important; border: 1px solid #334155 !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
