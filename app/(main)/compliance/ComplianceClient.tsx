"use client";

import React, { useState } from "react";
import { LotteryEvent, Vehicle } from "@/types";
import {
  Award,
  Gift,
  Users,
  Trophy,
  ChevronRight,
  PlayCircle,
} from "lucide-react";

interface ComplianceClientProps {
  initialLotteries: LotteryEvent[];
  initialLeaders: Vehicle[];
}

export default function ComplianceClient({
  initialLotteries,
  initialLeaders,
}: ComplianceClientProps) {
  const [lotteries] = useState<LotteryEvent[]>(initialLotteries);
  const [leaders] = useState<Vehicle[]>(initialLeaders);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Compliance Program
          </h1>
          <p className="text-sm text-slate-400">
            Incentivizing safe driving through rewards and compliance points.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex items-center justify-center bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg border border-blue-500/20 text-xs font-medium w-full sm:w-auto">
            <Users size={14} className="mr-2" /> 4.2k Active Participants
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 bg-gradient-to-br from-blue-600/10 to-transparent">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                <Gift size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  Compliance Lottery
                </h3>
                <p className="text-sm text-slate-400">
                  Monthly safe driver draws funded by traffic penalties.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {lotteries.map((lottery) => (
                <div
                  key={lottery.id}
                  className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-200">{lottery.name}</h4>
                    <div className="flex gap-4 mt-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                        Pool:{" "}
                        <span className="text-emerald-400 font-bold">
                          ${lottery.pool_amount}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                        Min Points:{" "}
                        <span className="text-blue-400 font-bold">
                          {lottery.minimum_points}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded border ${
                        lottery.status === "OPEN"
                          ? "text-blue-500 border-blue-500/20"
                          : "text-slate-500 border-slate-800"
                      }`}
                    >
                      {lottery.status}
                    </span>
                    {lottery.status === "OPEN" ? (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                        <PlayCircle size={14} /> Run Draw
                      </button>
                    ) : (
                      <button className="px-4 py-1.5 border border-slate-700 text-slate-400 rounded-lg text-xs font-bold transition-colors">
                        View Winners ({lottery.winners_count})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Award size={16} className="text-blue-500" /> Compliance
              Performance Chart
            </h3>
            <div className="h-48 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-center">
              <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                Compliance growth trend would render here
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Safe Driver
              Leaderboard
            </h3>
            <button className="text-[10px] text-blue-500 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {leaders.slice(0, 5).map((driver, index) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      index < 3
                        ? "bg-amber-500/20 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      {driver.owner_name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                      {driver.license_plate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-400">
                    {driver.compliance_points}
                  </p>
                  <p className="text-[8px] text-slate-600 uppercase font-bold italic">
                    Points
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
            <h4 className="text-xs font-bold text-blue-400 mb-2 underline decoration-blue-400/30">
              Program Tip
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Compliance points are awarded for every 10 missions where the
              vehicle is observed maintaining speed limits and traffic signals.
            </p>
            <button className="mt-3 text-[10px] font-bold text-blue-400 flex items-center gap-1 group">
              Learn More{" "}
              <ChevronRight
                size={10}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
