"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSession } from "next-auth/react";

export interface StreamFrame {
  frame_data: string;
  frame_number: number;
  timestamp: number;
}

export const useVideoStream = (streamId: string | null) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [source, setSource] = useState<'LIVE' | 'SIMULATED' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    if (!streamId) {
      console.warn(
        "useVideoStream: No streamId provided, skipping connection.",
      );
      return;
    }

    const session = await getSession();
    if (!session?.accessToken) {
      console.error(
        "useVideoStream: No token available for stream authentication",
      );
      setError("Authentication required");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.host; // Actual host including port (e.g. localhost:3000)

    // Check environment variables
    if (process.env.NEXT_PUBLIC_WS_URL) {
      host = process.env.NEXT_PUBLIC_WS_URL;
      console.log(`useVideoStream: Using NEXT_PUBLIC_WS_URL = ${host}`);
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_URL);
        host = url.host;
        console.log(
          `useVideoStream: Derived host ${host} from NEXT_PUBLIC_API_URL`,
        );
      } catch (e) {
        console.warn(
          "useVideoStream: Could not parse NEXT_PUBLIC_API_URL for WebSocket host",
        );
      }
    }

    // LOCAL DEVELOPMENT ROBUSTNESS:
    // If we're on localhost:3000 and haven't explicitly set a different host,
    // it's almost certain the WS should be on the backend port 8000.
    if (host.includes("localhost:3000") || host === "localhost") {
      console.log(
        `useVideoStream: Localhost detected (${host}), defaulting WS to port 8000`,
      );
      host = "localhost:8000";
    }

    const wsUrl = `${protocol}//${host}/ws/stream/${streamId}/`;

    console.log(`[WebSocket] Attempting connection to: ${wsUrl}`);

    // Close existing connection if any
    if (wsRef.current) {
      console.log(
        "[WebSocket] Closing existing connection before new attempt.",
      );
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(
          `[WebSocket] Connected to ${wsUrl}. Sending authentication token...`,
        );
        ws.send(
          JSON.stringify({
            type: "authenticate",
            token: session.accessToken,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "auth_success") {
            console.log("[WebSocket] Authentication successful.");
            setIsConnected(true);
            setError(null);
          } else if (data.type === "live_frame") {
            setFrame(data.frame_data);
            if (data.source) {
              setSource(data.source);
            }
            if (!isConnected) setIsConnected(true);
          } else if (data.error) {
            console.error("[WebSocket] Server error message:", data.error);
            setError(`Server: ${data.error}`);
          }
        } catch (err) {
          console.error("[WebSocket] Message parse error:", err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        const reason =
          event.reason ||
          (event.code === 1006 ? "Abnormal Closure" : `Code ${event.code}`);
        console.log(`[WebSocket] Connection closed: ${reason}`);
        if (event.code !== 1000) {
          setError(`Stream closed: ${reason}`);
        }
      };

      ws.onerror = (err) => {
        const msg = `Connection failed for ${wsUrl}. Check if server is running on ${host}.`;
        setError(msg);
        console.error("[WebSocket] Connection error detail:", err);
      };
    } catch (e) {
      console.error("[WebSocket] Initialization error:", e);
      setError("Failed to initialize WebSocket");
    }
  }, [streamId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { frame, source, isConnected, error, reconnect: connect };
};
