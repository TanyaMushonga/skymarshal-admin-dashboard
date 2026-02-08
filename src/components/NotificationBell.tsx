"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { Notification } from "@/types";
import { toast } from "sonner";
import { notificationService } from "@/lib/notification-service";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications from REST API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === "unread") {
        params.append("is_read", "false");
      }
      params.append("ordering", "-created_at");

      const response = await api.get<any>(
        `/notifications/?${params.toString()}`,
      );

      if (Array.isArray(response)) {
        setNotifications(response.slice(0, 10));
      } else if (response && "results" in response) {
        setNotifications(response.results.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize WebSocket and subscribe to notifications
  useEffect(() => {
    if (session?.accessToken) {
      notificationService.setToken(session.accessToken);
      notificationService.connect();

      // Subscribe to new notifications
      const unsubscribe = notificationService.subscribe((notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 10));
      });

      // Fetch initial notifications
      fetchNotifications();

      return () => {
        unsubscribe();
      };
    }
  }, [session?.accessToken]);

  // Refetch when filter changes
  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
  }, [filter]);

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
    } catch (error) {
      toast.error("Failed to mark notification as read");
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system_alert":
        return "🚨";
      case "mission_update":
        return "✈️";
      case "stream_health":
        return "📡";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-all"
      >
        <Bell size={20} className="text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-card border border-border/50 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="text-lg font-bold text-foreground">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter(filter === "all" ? "unread" : "all")}
                  className="p-2 rounded-lg hover:bg-muted/30 transition-all"
                  title={filter === "all" ? "Show unread only" : "Show all"}
                >
                  <Filter size={16} className="text-muted-foreground" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 rounded-lg hover:bg-muted/30 transition-all"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} className="text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted/30 transition-all"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    size={48}
                    className="mx-auto text-muted-foreground/30 mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/20 transition-colors ${
                        !notification.is_read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {getNotificationIcon(
                                notification.notification_type,
                              )}
                            </span>
                            <h4 className="text-sm font-bold text-foreground">
                              {notification.title}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-muted/30 transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} className="text-emerald-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-muted/30 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
