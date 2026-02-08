import { toast } from "sonner";

type NotificationCallback = (notification: any) => void;

class NotificationService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private authenticated: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: NotificationCallback[] = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private wsUrl: string = "";

  constructor() {
    // WebSocket URL will be determined at runtime in connect()
  }

  private getWebSocketUrl(): string {
    if (typeof window === "undefined") {
      return "";
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Always use port 8000 for backend server
    const host = process.env.NEXT_PUBLIC_WS_URL || "localhost:8000";
    return `${protocol}//${host}/ws/notifications/`;
  }

  setToken(token: string) {
    this.token = token;
  }

  connect() {
    if (typeof window === "undefined") {
      console.log("WebSocket not available in SSR");
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected");
      return;
    }

    if (!this.token) {
      console.error("No token provided for WebSocket authentication");
      return;
    }

    // Get WebSocket URL at runtime
    this.wsUrl = this.getWebSocketUrl();
    if (!this.wsUrl) {
      console.error("Failed to determine WebSocket URL");
      return;
    }

    try {
      console.log("Connecting to WebSocket:", this.wsUrl);
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected, sending authentication...");
        // CRITICAL: Send authentication as first message
        this.ws?.send(
          JSON.stringify({
            type: "authenticate",
            token: this.token,
          }),
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "auth_success") {
            console.log("WebSocket authentication successful");
            this.authenticated = true;
            this.reconnectAttempts = 0;
          } else if (data.error) {
            console.error("WebSocket error:", data.error);
            toast.error(`WebSocket error: ${data.error}`);
            this.ws?.close();
          } else if (data.type === "notification") {
            console.log("New notification received:", data);
            this.handleNotification(data);
          } else if (data.type === "ping") {
            // Respond to server ping with pong
            this.ws?.send(JSON.stringify({ type: "pong" }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onerror = (error) => {
        // Log error but don't show toast - connection failures are handled in onclose
        console.warn(
          "WebSocket connection error (will attempt reconnect):",
          error,
        );
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        this.authenticated = false;

        // Only show error if it's not a normal closure and we've exhausted reconnect attempts
        if (
          event.code !== 1000 &&
          this.reconnectAttempts >= this.maxReconnectAttempts
        ) {
          console.error("WebSocket connection failed permanently");
        }

        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.attemptReconnect();
    }
  }

  private handleNotification(notification: any) {
    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error("Error in notification listener:", error);
      }
    });

    // Show toast for important notifications
    if (
      notification.notification_type === "system_alert" ||
      notification.notification_type === "mission_update"
    ) {
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    }

    // Request browser notification permission if not already granted
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Show browser notification if permitted
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = 1000 * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      console.log(
        `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.warn(
        "Max WebSocket reconnection attempts reached. Real-time notifications disabled.",
      );
      // Don't show toast error - just log it. User can still use the app without real-time updates
    }
  }

  subscribe(callback: NotificationCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.authenticated = false;
    this.reconnectAttempts = 0;
    this.listeners = [];
  }

  isConnected(): boolean {
    return this.authenticated && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const notificationService = new NotificationService();
