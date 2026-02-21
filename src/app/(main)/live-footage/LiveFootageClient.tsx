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
import { VideoStream } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import StartPatrolModal from "../patrols/components/StartPatrolModal";
import { useRouter, useSearchParams } from "next/navigation";

interface LiveFootageClientProps {
  initialStreams: VideoStream[];
}

export default function LiveFootageClient({
  initialStreams,
}: LiveFootageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [streams, setStreams] = useState<VideoStream[]>(initialStreams);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(
    () => {
      const sId = searchParams.get("streamId");
      if (sId) return sId;

      const dId = searchParams.get("droneId");
      if (dId) {
        const stream = initialStreams.find((s) => s.drone_id === dId);
        if (stream) return stream.stream_id;
      }

      return (
        initialStreams.find((s) => s.active_patrol)?.stream_id ||
        initialStreams[0]?.stream_id ||
        null
      );
    },
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const activePatrolStreams = streams.filter((s) => s.active_patrol);
  const selectedStream = activePatrolStreams.find(
    (s) => s.stream_id === selectedStreamId,
  );

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const response = await api.get<any>("/streams/");
      setStreams(response.results || []);
    } catch (error) {
      toast.error("Failed to refresh streams");
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

    console.log("Streams available:", streams.length);
    console.log("Selected Stream ID:", selectedStreamId);

    if (streamId && streamId !== selectedStreamId) {
      setSelectedStreamId(streamId);
    } else if (droneId) {
      const stream = streams.find((s) => s.drone_id === droneId);
      if (stream && stream.stream_id !== selectedStreamId) {
        setSelectedStreamId(stream.stream_id);
      }
    }
  }, [searchParams, streams]);

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
              {activePatrolStreams.map((stream) => (
                <button
                  key={stream.stream_id}
                  onClick={() => setSelectedStreamId(stream.stream_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedStreamId === stream.stream_id
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                      : "bg-muted/20 border-border/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${selectedStreamId === stream.stream_id ? "text-primary" : "text-foreground"}`}
                    >
                      {stream.active_patrol?.officer_name}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Plane size={10} />
                    <span>
                      {stream.drone_name} ({stream.drone_id})
                    </span>
                  </div>
                </button>
              ))}
              {activePatrolStreams.length === 0 && (
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
          {selectedStream ? (
            <div className="space-y-4">
              {selectedStream.active_patrol ? (
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                        <Activity size={12} />
                        Active Patrol
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                        <User size={14} className="text-muted-foreground" />
                        {selectedStream.active_patrol.officer_name}
                      </div>
                    </div>
                  </div>
                  <LiveStreamPlayer
                    streamId={selectedStream.stream_id}
                    droneName={selectedStream.drone_name}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-12 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              {activePatrolStreams.length > 0 ? (
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
