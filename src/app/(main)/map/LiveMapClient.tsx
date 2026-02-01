"use client";

import React, { useEffect, useRef, useState } from "react";
import { mockApi } from "@/lib/mockApi";
import { Drone, Patrol } from "@/types";
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LiveMapClient() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const pathsRef = useRef<any[]>([]);

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
      const [droneData, patrolData] = await Promise.all([
        mockApi.getDrones(),
        mockApi.getPatrols(),
      ]);
      setDrones(droneData);
      setPatrols(patrolData);
    };
    fetchData();

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

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    pathsRef.current.forEach((p) => p.remove());
    pathsRef.current = [];

    patrols.forEach((patrol) => {
      if (
        patrol.status === "ACTIVE" &&
        patrol.patrol_config?.flight_path &&
        patrol.patrol_config.flight_path.length > 0
      ) {
        const polyline = L.polyline(
          patrol.patrol_config.flight_path.map((coord) => [coord[1], coord[0]]),
          {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.6,
            dashArray: "10, 10",
          },
        ).addTo(mapRef.current);
        pathsRef.current.push(polyline);
      }
    });

    drones.forEach((drone) => {
      if (drone.latest_location) {
        const isOnline = drone.status?.status === "online";
        const marker = L.circleMarker(
          [drone.latest_location.latitude, drone.latest_location.longitude],
          {
            radius: 10,
            fillColor: isOnline ? "#10b981" : "#64748b",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          },
        ).addTo(mapRef.current);

        const popupContent = `
          <div class="p-3 text-slate-100 bg-slate-900 rounded-lg min-w-[200px] border border-slate-700">
            <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
              <h4 class="font-bold text-sm">${drone.name}</h4>
              <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">${drone.drone_id}</span>
            </div>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">Battery</span>
                <span class="font-medium">${drone.status?.battery_level}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Altitude</span>
                <span class="font-medium">${drone.latest_location.altitude}m</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "custom-leaflet-popup",
          closeButton: false,
          minWidth: 200,
        });

        markersRef.current.push(marker);
      }
    });
  }, [drones, patrols]);

  return (
    <div className="h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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

      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-[1000] bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 md:p-5 min-w-[180px] md:min-w-[260px] shadow-2xl border border-white/10 hidden sm:block">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs md:text-sm font-bold text-slate-100 flex items-center gap-2">
            <Navigation size={14} className="text-blue-500" /> Live Assets
          </h3>
        </div>
        <div className="space-y-2 md:space-y-4 max-h-[150px] overflow-y-auto pr-1 scrollbar-none">
          {drones.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              onClick={() =>
                d.latest_location &&
                mapRef.current?.setView(
                  [d.latest_location.latitude, d.latest_location.longitude],
                  15,
                )
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    d.status?.status === "online"
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-slate-500"
                  }`}
                ></span>
                <span className="text-[10px] md:text-xs font-bold text-slate-200">
                  {d.name}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">
                {d.status?.battery_level}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`
        absolute top-4 left-4 md:top-6 md:left-6 z-[1000] bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 transition-all duration-300
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

      <style>{`
        .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .leaflet-popup-tip { background: #0f172a !important; border: 1px solid #334155 !important; }
        .leaflet-popup-content { margin: 0 !important; }
      `}</style>
    </div>
  );
}
