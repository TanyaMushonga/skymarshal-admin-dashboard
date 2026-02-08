"use client";

import React, { useEffect, useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import { Drone, Patrol } from "@/types";
import { api } from "@/lib/api";
import {
  Plane,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Plus,
  Trash2,
  Map as MapIcon,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface StartPatrolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarted: () => void;
  editPatrol?: Patrol;
}

export default function StartPatrolModal({
  isOpen,
  onClose,
  onStarted,
  editPatrol,
}: StartPatrolModalProps) {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [speedLimit, setSpeedLimit] = useState(80);
  const [restrictedZones, setRestrictedZones] = useState("");

  // New features
  const [route, setRoute] = useState<[number, number][]>([]);
  const [customFields, setCustomFields] = useState<
    { key: string; value: string }[]
  >([]);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editPatrol) {
        setSelectedDroneId(String(editPatrol.drone));
        setSelectedOfficerId(String(editPatrol.officer));
        setSpeedLimit(
          editPatrol.patrol_config?.speed_limit ||
            editPatrol.patrol_config?.speed ||
            60,
        );
        setRestrictedZones(
          editPatrol.patrol_config?.restricted_zones?.join(", ") || "",
        );
        setRoute(editPatrol.patrol_config?.flight_path || []);
        setCustomFields(
          Object.entries(editPatrol.patrol_config || {})
            .filter(
              ([key]) =>
                ![
                  "speed_limit",
                  "speed",
                  "restricted_zones",
                  "flight_path",
                ].includes(key),
            )
            .map(([key, value]) => ({ key, value: String(value) })),
        );
      } else {
        setSelectedDroneId("");
        setSelectedOfficerId("");
        setSpeedLimit(80);
        setRestrictedZones("");
        setRoute([]);
        setCustomFields([]);
      }
      fetchInitialData();
      loadLeaflet();
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const loadLeaflet = () => {
    if (typeof window === "undefined" || (window as any).L) {
      if ((window as any).L) setTimeout(initMap, 100);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (mapContainerRef.current && !mapRef.current) {
      // @ts-ignore
      const L = window.L;
      if (!L) return;

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-17.8292, 31.0522], 13);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 20 },
      ).addTo(mapRef.current);

      mapRef.current.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setRoute((prev) => [...prev, [lat, lng]]);
      });
    }
  };

  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !mapRef.current) return;

    if (routeLayerRef.current) routeLayerRef.current.remove();
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (route.length > 0) {
      routeLayerRef.current = L.polyline(route, {
        color: "#3b82f6",
        weight: 3,
        dashArray: "5, 5",
      }).addTo(mapRef.current);

      route.forEach((coord, i) => {
        const marker = L.circleMarker(coord, {
          radius: 5,
          fillColor: i === 0 ? "#10b981" : "#3b82f6",
          color: "#fff",
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    }
  }, [route]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [dronesRes, usersRes] = await Promise.all([
        api.get<any>("/drones/"),
        api.get<any>("/users/"),
      ]);

      const allDrones = Array.isArray(dronesRes)
        ? dronesRes
        : dronesRes.results || [];
      setDrones(allDrones);

      const allUsers = Array.isArray(usersRes)
        ? usersRes
        : usersRes.results || [];
      setUsers(
        allUsers.filter((u: any) => u.is_officer || u.role === "OFFICER"),
      );
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Could not load available resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDroneId) {
      toast.error("Please select a drone");
      return;
    }
    if (!selectedOfficerId) {
      toast.error("Please assign an officer");
      return;
    }

    setSubmitting(true);
    try {
      const config: any = {
        speed_limit: Number(speedLimit),
        restricted_zones: restrictedZones
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean),
        flight_path: route.map((coord) => [coord[1], coord[0]]), // API expects [lon, lat]
      };

      // Add custom fields
      customFields.forEach((field) => {
        if (field.key.trim()) {
          config[field.key.trim()] = field.value;
        }
      });

      // Be robust with field names and types for the backend
      const droneId = isNaN(Number(selectedDroneId))
        ? selectedDroneId
        : Number(selectedDroneId);
      const officerId = isNaN(Number(selectedOfficerId))
        ? selectedOfficerId
        : Number(selectedOfficerId);

      const payload: any = {
        drone_id:
          drones.find((d) => String(d.id) === String(selectedDroneId))
            ?.drone_id || String(selectedDroneId),
        officer: officerId,
        config: config, // Alternative key used by some backends
        ...config, // Flattened for root-level coverage
      };

      if (editPatrol) {
        await api.patch(`/patrols/${editPatrol.id}/`, payload);
        toast.success("Patrol updated successfully");
      } else {
        await api.post("/patrols/start/", payload);
        toast.success("Patrol started successfully");
      }
      onStarted();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Drone is already on an active patrol");
      } else {
        toast.error("Failed to start patrol");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editPatrol ? "Edit Patrol Configuration" : "Start New Patrol"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Select Drone
          </label>
          {loading ? (
            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
              <Loader2 className="animate-spin text-primary mr-2" size={18} />
              <span className="text-xs text-muted-foreground">
                Scanning fleet...
              </span>
            </div>
          ) : drones.length > 0 ? (
            <select
              value={selectedDroneId}
              onChange={(e) => setSelectedDroneId(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold appearance-none"
              disabled={!!editPatrol}
            >
              <option value="">Select a drone...</option>
              {drones.map((drone) => (
                <option key={drone.id} value={drone.id}>
                  {drone.name} ({drone.drone_id})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
              <AlertCircle className="text-destructive mb-2" size={32} />
              <p className="text-sm font-bold text-destructive">
                No Drones Available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All drones are currently offline or assigned.
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Assign Officer
          </label>
          <select
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold appearance-none"
          >
            <option value="">Select an officer...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground">
            Patrol Route
          </label>
          <div className="relative rounded-lg overflow-hidden border border-border h-48 bg-muted/20">
            <div ref={mapContainerRef} className="w-full h-full z-0" />
            <div className="absolute top-2 right-2 z-40 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setRoute([])}
                className="p-1.5 bg-background shadow-lg border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                title="Reset Route"
              >
                <RotateCcw size={14} />
              </button>
            </div>
            {route.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border flex items-center gap-2 shadow-lg">
                  <MapIcon size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Click on map to draw route
                  </span>
                </div>
              </div>
            )}
          </div>
          {route.length > 0 && (
            <p className="text-[10px] text-muted-foreground italic">
              {route.length} waypoints selected
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Speed Limit (km/h)
              </label>
              <input
                type="number"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(parseInt(e.target.value))}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Restricted Zones
              </label>
              <input
                type="text"
                placeholder="Zone A, Zone B"
                value={restrictedZones}
                onChange={(e) => setRestrictedZones(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              Custom Metadata Fields
            </label>
            <button
              type="button"
              onClick={() =>
                setCustomFields((prev) => [...prev, { key: "", value: "" }])
              }
              className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-primary/20 transition-all"
            >
              <Plus size={12} /> Add Field
            </button>
          </div>

          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. priority)"
                  value={field.key}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].key = e.target.value;
                    setCustomFields(newFields);
                  }}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].value = e.target.value;
                    setCustomFields(newFields);
                  }}
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCustomFields((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {customFields.length === 0 && (
              <p className="text-[10px] text-muted-foreground italic text-center py-2 bg-muted/5 rounded-lg border border-dashed border-border/50">
                No custom metadata added
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !selectedDroneId}
            className={`w-full font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
              submitting || !selectedDroneId
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              <>
                <Plane size={18} />
                {editPatrol ? "Save Changes" : "Launch Mission"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
