"use client";

import React, { useState } from "react";
import { Notification } from "@/types";
import {
  Bell,
  AlertTriangle,
  Shield,
  Settings,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const [notifications] = useState<Notification[]>(initialNotifications);

  const getIcon = (type: string) => {
    switch (type) {
      case "violation":
        return <AlertTriangle size={18} className="text-red-500" />;
      case "mission_update":
        return <Shield size={18} className="text-blue-500" />;
      case "system":
        return <Settings size={18} className="text-amber-500" />;
      default:
        return <Bell size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">
            Notifications
          </h1>
          <p className="text-sm text-slate-400">
            Stay updated on system alerts, mission changes, and violation
            events.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none text-xs text-slate-400 hover:text-slate-100 px-3 py-1.5 bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
            Mark all read
          </button>
          <button className="p-2 text-slate-500 hover:text-red-400 bg-slate-800/50 rounded-lg border border-slate-700 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border transition-all flex items-start gap-4 cursor-pointer
              ${
                n.is_read
                  ? "border-slate-800 opacity-80"
                  : "border-blue-500/30 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
              }
            `}
          >
            <div
              className={`p-2 rounded-xl ${
                n.is_read ? "bg-slate-800" : "bg-white/5"
              }`}
            >
              {getIcon(n.notification_type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className={`text-sm font-bold ${
                    n.is_read ? "text-slate-300" : "text-slate-100"
                  }`}
                >
                  {n.title}
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {new Date(n.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {n.message}
              </p>
              <div className="flex gap-4 mt-3">
                <button className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                  View Case
                </button>
                {!n.is_read && (
                  <button className="text-[10px] font-bold text-slate-500 hover:text-emerald-500 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <CheckCircle size={10} /> Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-slate-800">
            <Bell size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-slate-400 font-bold uppercase tracking-widest">
              No new notifications
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              You're all caught up for now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
