"use client";

import React, { useRef } from "react";
import { useVideoStream } from "@/hooks/useVideoStream";
import { Activity, Wifi, WifiOff, AlertCircle, Maximize2 } from "lucide-react";

interface LiveStreamPlayerProps {
  streamId: string;
  droneName?: string;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  streamId,
  droneName = "Drone Feed",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { frame, isConnected, error } = useVideoStream(streamId);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl transition-all duration-500 hover:shadow-primary/20"
    >
      {/* Top Bar / Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-bold text-base tracking-widest uppercase">
            Live • {droneName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Video Display Area */}
      <div className="aspect-video w-full flex items-center justify-center bg-[#0a0a0a]">
        {frame ? (
          <img
            src={`data:image/jpeg;base64,${frame}`}
            alt="Live Stream"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            {isConnected ? (
              <>
                <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse">
                  Waiting for frame data...
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircle size={48} className="text-destructive/50" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </>
            ) : (
              <>
                <WifiOff size={48} className="text-muted-foreground/30" />
                <p className="text-sm font-medium">Stream Offline</p>
              </>
            )}
          </div>
        )}

        {/* Overlay Detections Badge (Simulated logic indicator) */}
        {frame && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-tighter">
              AI Processing Enabled
            </span>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-4"></div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
            />
            {isConnected ? "Connection: Stable" : "Disconnected"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamPlayer;
