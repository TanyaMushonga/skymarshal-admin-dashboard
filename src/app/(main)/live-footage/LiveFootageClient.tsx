"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  Plane,
  Shield,
  User,
  Wifi,
  WifiOff,
  LayoutGrid,
} from "lucide-react";
import LiveStreamPlayer from "@/components/streaming/LiveStreamPlayer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import StartPatrolModal from "../patrols/components/StartPatrolModal";
import { useRouter, useSearchParams } from "next/navigation";
import { Patrol, PaginatedResponse, VideoStream } from "@/types";

interface LiveFootageClientProps {
  initialStreams: VideoStream[];
}

export default function LiveFootageClient({
  initialStreams,
}: LiveFootageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [streams, setStreams] = useState<VideoStream[]>(initialStreams);
  const [activePatrols, setActivePatrols] = useState<Patrol[]>([]);
  const [selectedPatrolId, setSelectedPatrolId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Robust matching helper
  const getMatchingStream = (patrol: Patrol, allStreams: VideoStream[]) => {
    return allStreams.find((s) => {
      // Direct link from backend
      if (s.active_patrol?.id === patrol.id) return true;

      // Manual matching by IDs
      const pDroneId = String(patrol.drone_id_str || patrol.drone_id || "");
      const sDroneId = String(s.drone_id || "");
      const pDroneUUID = String(patrol.drone || "");
      const sDroneUUID = String(s.drone || "");

      return (
        (pDroneId !== "" && pDroneId === sDroneId) ||
        (pDroneUUID !== "" && pDroneUUID === sDroneUUID)
      );
    });
  };

  const selectedPatrol = activePatrols.find(
    (p) => String(p.id) === String(selectedPatrolId),
  );
  const selectedStream = selectedPatrol
    ? getMatchingStream(selectedPatrol, streams)
    : null;

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const [streamsRes, patrolsRes] = await Promise.all([
        api.get<PaginatedResponse<VideoStream>>("/streams/"),
        api.get<PaginatedResponse<Patrol>>("/patrols/?status=ACTIVE"),
      ]);

      const fetchedStreams = streamsRes.results || [];
      const fetchedPatrols = patrolsRes.results || [];

      console.log("Fetched Patrols:", fetchedPatrols.length);
      console.log("Fetched Streams:", fetchedStreams.length);

      // Debug log first fetched patrol/stream IDs
      if (fetchedPatrols.length > 0) {
        console.log("First Patrol Data Sample:", {
          id: fetchedPatrols[0].id,
          drone_id: fetchedPatrols[0].drone_id,
          drone_id_str: fetchedPatrols[0].drone_id_str,
          drone_ref: fetchedPatrols[0].drone,
        });
      }
      if (fetchedStreams.length > 0) {
        console.log("First Stream Data Sample:", {
          stream_id: fetchedStreams[0].stream_id,
          drone_id: fetchedStreams[0].drone_id,
          drone_ref: fetchedStreams[0].drone,
        });
      }

      setStreams(fetchedStreams);
      setActivePatrols(fetchedPatrols);
    } catch (error) {
      toast.error("Failed to refresh feed data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const streamId = searchParams.get("streamId");
    const droneId = searchParams.get("droneId");
    const patrolId = searchParams.get("patrolId");

    if (patrolId) {
      setSelectedPatrolId(patrolId);
    } else if (streamId) {
      const p = activePatrols.find(
        (patrol) => getMatchingStream(patrol, streams)?.stream_id === streamId,
      );
      if (p) setSelectedPatrolId(String(p.id));
    } else if (droneId) {
      const p = activePatrols.find(
        (patrol) => String(patrol.drone_id_str || patrol.drone_id) === droneId,
      );
      if (p) setSelectedPatrolId(String(p.id));
    } else if (activePatrols.length > 0 && !selectedPatrolId) {
      setSelectedPatrolId(String(activePatrols[0].id));
    }
  }, [searchParams, streams, activePatrols]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Footage</h1>
          <p className="text-base text-muted-foreground mt-1">
            Real-time drone supervision and telemetry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Drone Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-xl">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Active Patrols
            </h3>
            <div className="space-y-2">
              {activePatrols.map((patrol) => {
                const stream = getMatchingStream(patrol, streams);
                const isSelected = String(patrol.id) === selectedPatrolId;

                return (
                  <button
                    key={patrol.id}
                    onClick={() => setSelectedPatrolId(String(patrol.id))}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                        : "bg-muted/20 border-border/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {patrol.officer_name ||
                          patrol.officer_email ||
                          "Unknown Officer"}
                      </span>
                      {stream ? (
                        <div
                          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                          title="Feed available"
                        />
                      ) : (
                        <div
                          className="w-2 h-2 rounded-full bg-amber-500"
                          title="Telemetry only"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                        <Plane size={10} />
                        <span>
                          Drone: {patrol.drone_id_str || patrol.drone_id}
                        </span>
                      </div>
                      <div className="text-[9px] text-muted-foreground/60 flex items-center gap-1.5 uppercase font-medium tracking-widest">
                        {stream ? (
                          <>
                            <Wifi size={10} className="text-emerald-500" />
                            Feed Linked
                          </>
                        ) : (
                          <>
                            <WifiOff size={10} className="text-amber-500" />
                            Linking Feed...
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {activePatrols.length === 0 && (
                <div className="py-8 text-center bg-muted/10 rounded-lg border border-dashed border-border/40">
                  <p className="text-xs text-muted-foreground italic">
                    No active patrols
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Player or empty state */}
        <div className="lg:col-span-3">
          {selectedPatrol ? (
            <div className="space-y-4">
              <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-xl min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase tracking-wider">
                      <Activity size={14} />
                      Active Patrol
                    </div>
                    <div className="flex items-center gap-2 text-base font-semibold text-foreground/80">
                      <User size={18} className="text-muted-foreground" />
                      {selectedPatrol.officer_name ||
                        selectedPatrol.officer_email ||
                        "Unknown Officer"}
                    </div>
                  </div>
                </div>

                <div className="flex-1 rounded-lg overflow-hidden relative">
                  {selectedStream ? (
                    <LiveStreamPlayer
                      streamId={selectedStream.stream_id}
                      droneName={selectedStream.drone_name}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[400px] bg-muted/30 flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="p-4 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20">
                        <AlertCircle size={48} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">
                          Awaiting Video Link
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                          The patrol is active and transmitting telemetry, but
                          the live video feed for
                          <span className="text-primary font-bold px-1">
                            {selectedPatrol.drone_id_str ||
                              selectedPatrol.drone_id}
                          </span>
                          is still initializing or unavailable.
                        </p>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl border border-border/50 text-[10px] space-y-2 w-full max-w-md text-left font-mono">
                        <p className="text-muted-foreground uppercase border-b border-border/50 pb-1 mb-1 font-bold">
                          Diagnostic Info
                        </p>
                        <p>Patrol ID: {selectedPatrol.id}</p>
                        <p>
                          Drone ID:{" "}
                          {selectedPatrol.drone_id_str ||
                            selectedPatrol.drone_id}
                        </p>
                        <p>Drone Ref: {String(selectedPatrol.drone)}</p>
                        <p className="border-t border-border/50 pt-1 mt-1">
                          Available Streams: {streams.length}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={async () => {
                              try {
                                // Find or create a stream first if needed, but here we assume we might need to create one
                                // Or just try to trigger simulation if we can find a stream ID
                                const droneId =
                                  selectedPatrol.drone_id_str ||
                                  selectedPatrol.drone_id;
                                toast.promise(
                                  api
                                    .post(`/streams/simulate_for_drone/`, {
                                      drone_id: droneId,
                                      patrol_id: selectedPatrol.id,
                                    })
                                    .catch((err: any) => {
                                      if (
                                        err.response?.data?.error?.includes(
                                          "already active",
                                        )
                                      ) {
                                        // Ignore and proceed
                                        return;
                                      }
                                      throw err;
                                    }),
                                  {
                                    loading: "Starting simulation...",
                                    success:
                                      "Simulation started! Refreshing...",
                                    error: "Failed to start simulation",
                                  },
                                );
                                setTimeout(
                                  () => window.location.reload(),
                                  2000,
                                );
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-bold rounded uppercase transition-colors"
                          >
                            Force Start Sample Simulation
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-12 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              {activePatrols.length > 0 ? (
                <>
                  <Activity className="text-primary/20 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-foreground">
                    Select a Patrol
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    Choose an active mission from the sidebar to view the live
                    officer feed and drone telemetry.
                  </p>
                </>
              ) : (
                <>
                  <Shield className="text-muted-foreground/20 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-foreground">
                    No Active Patrols
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mb-8">
                    There are no ongoing missions at the moment.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Plane size={20} />
                    Launch New Mission
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <StartPatrolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStarted={() => {
          fetchStreams();
          toast.success("Patrol initiated successfully");
        }}
      />
    </div>
  );
}
