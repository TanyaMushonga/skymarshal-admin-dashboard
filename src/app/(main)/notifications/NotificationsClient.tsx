"use client";

import React, { useState, useEffect } from "react";
import { Notification, PaginatedResponse } from "@/types";
import {
  Bell,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Filter,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface NotificationsClientProps {
  initialData: PaginatedResponse<Notification>;
}

export default function NotificationsClient({
  initialData,
}: NotificationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notifications, setNotifications] = useState<Notification[]>(
    initialData?.results || [],
  );
  const [pagination, setPagination] = useState({
    count: initialData?.count || 0,
    next: initialData?.next,
    previous: initialData?.previous,
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.append("ordering", "-created_at");

      const response = await api.get<any>(
        `/notifications/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setNotifications(response);
        setPagination({ count: response.length, next: null, previous: null });
      } else if (
        response &&
        typeof response === "object" &&
        "results" in response
      ) {
        setNotifications(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/notifications?${params.toString()}`);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n,
        ),
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark_all_read/");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "system_alert":
        return <AlertTriangle size={18} className="text-red-500" />;
      case "mission_update":
        return <span className="text-lg">✈️</span>;
      case "stream_health":
        return <span className="text-lg">📡</span>;
      default:
        return <Bell size={18} className="text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-base text-muted-foreground mt-1">
            Stay updated on system alerts, mission changes, and violation
            events.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex-1 sm:flex-none text-sm font-semibold text-foreground hover:text-primary px-4 py-2 bg-muted/30 rounded-lg transition-all border border-border/60"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={searchParams.get("is_read") || ""}
          onChange={(e) => updateFilters("is_read", e.target.value)}
          className="px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="">All Notifications</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <select
          value={searchParams.get("notification_type") || ""}
          onChange={(e) => updateFilters("notification_type", e.target.value)}
          className="px-4 py-2 bg-muted/30 border border-border/60 rounded-lg text-sm font-medium appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        >
          <option value="">All Types</option>
          <option value="system_alert">System Alerts</option>
          <option value="mission_update">Mission Updates</option>
          <option value="stream_health">Stream Health</option>
          <option value="general">General</option>
        </select>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/60"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Filter size={20} />
          )}
        </button>
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-card/40 backdrop-blur-md rounded-xl p-4 border transition-all flex items-start gap-4 ${
                n.is_read
                  ? "border-border/50 opacity-80"
                  : "border-primary/30 bg-primary/5 shadow-sm"
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  n.is_read ? "bg-muted/30" : "bg-primary/10"
                }`}
              >
                {getIcon(n.notification_type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3
                    className={`text-base font-bold ${
                      n.is_read ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {n.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(n.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {n.message}
                </p>
                <div className="flex gap-4 mt-3">
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle size={12} /> Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.count > notifications.length && (
            <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
              <p className="text-sm font-medium text-muted-foreground">
                Showing {notifications.length} of {pagination.count}{" "}
                notifications
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const page = parseInt(searchParams.get("page") || "1") - 1;
                    updateFilters("page", page.toString());
                  }}
                  disabled={!pagination.previous || loading}
                  className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const page = parseInt(searchParams.get("page") || "1") + 1;
                    updateFilters("page", page.toString());
                  }}
                  disabled={!pagination.next || loading}
                  className="px-4 py-2 rounded-lg border border-border/60 text-sm font-medium hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border/50">
          <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground">
            No notifications
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            You're all caught up for now.
          </p>
        </div>
      )}
    </div>
  );
}
