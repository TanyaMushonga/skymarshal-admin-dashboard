"use client";

import React from "react";
import { Patrol } from "@/types";
import { Shield, Clock, User, StopCircle, RefreshCw } from "lucide-react";

interface PatrolListItemProps {
  patrol: Patrol;
  onEnd: (id: number) => void;
  onUpdateConfig: (id: number) => void;
}

export default function PatrolListItem({
  patrol,
  onEnd,
  onUpdateConfig,
}: PatrolListItemProps) {
  const isActive = patrol.status === "ACTIVE";

  const duration = patrol.end_time
    ? `${Math.floor(
        (new Date(patrol.end_time).getTime() -
          new Date(patrol.start_time).getTime()) /
          60000,
      )} mins`
    : "Live";

  return (
    <div className="bg-card/40 hover:bg-card/60 border border-border/60 rounded-2xl p-6 transition-all group shadow-sm hover:shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6 flex-1">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 ${
              isActive
                ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "bg-slate-500/10 text-slate-400"
            }`}
          >
            <Shield size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h4 className="text-lg font-extrabold text-foreground tracking-tight">
                Mission {patrol.drone_id}
              </h4>
              {isActive && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black animate-pulse border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  LIVE OPERATIONAL
                </span>
              )}
              {!isActive && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border ${
                    patrol.status === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  {patrol.status}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-lg border border-border/40">
                <User size={16} className="text-indigo-400" />
                <span className="text-foreground/80">Officer:</span>{" "}
                {patrol.officer_name}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                {new Date(patrol.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                <span className="mx-1 opacity-30">•</span>
                {new Date(patrol.start_time).toLocaleDateString([], {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-primary font-bold">UID:</span>
                <span className="opacity-60 text-xs font-mono">
                  {patrol.id}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
          <div className="md:text-right px-4 py-2 bg-muted/20 rounded-xl border border-border/40 min-w-[120px]">
            <p className="text-base font-black text-foreground tabular-nums leading-none mb-1">
              {duration}
            </p>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-[0.2em]">
              Mission Time
            </p>
          </div>
          <div className="flex gap-2">
            {isActive && (
              <>
                <button
                  onClick={() => onUpdateConfig(patrol.id as number)}
                  className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-border/50"
                  title="Recalibrate Route"
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  onClick={() => onEnd(patrol.id as number)}
                  className="px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-destructive/20 active:scale-95"
                >
                  <StopCircle size={18} />
                  Abort Mission
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-60">
            Speed Directive
          </p>
          <p className="text-lg font-black text-foreground">
            {patrol.patrol_config.speed_limit || "60"}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              km/h
            </span>
          </p>
        </div>
        <div className="sm:col-span-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-black tracking-widest opacity-60">
            Designated Restricted Zones
          </p>
          <div className="flex flex-wrap gap-2">
            {patrol.patrol_config.restricted_zones?.length ? (
              patrol.patrol_config.restricted_zones.map((zone, i) => (
                <span
                  key={i}
                  className="text-xs font-bold px-3 py-1 bg-primary/5 text-primary rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors"
                >
                  {zone}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic bg-muted/10 px-4 py-1 rounded-lg border border-dashed border-border/40">
                No restricted airspace designated for this mission
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
