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
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    if (!streamId) return;

    const session = await getSession();
    if (!session?.accessToken) {
      console.error("No token available for stream authentication");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    let host = window.location.hostname + ":8000";
    if (process.env.NEXT_PUBLIC_WS_URL) {
      host = process.env.NEXT_PUBLIC_WS_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_URL);
        host = url.host;
      } catch (e) {
        console.warn("Could not parse API_URL for WebSocket host");
      }
    }

    const wsUrl = `${protocol}//${host}/ws/stream/${streamId}/`;

    console.log(`Connecting to stream: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Stream WebSocket connected, authenticating...");
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
          console.log("Stream authentication successful");
          setIsConnected(true);
          setError(null);
        } else if (data.type === "live_frame") {
          setFrame(data.frame_data);
        } else if (data.error) {
          console.error("Stream socket error:", data.error);
          setError(data.error);
        }
      } catch (err) {
        console.error("Error parsing stream message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("Stream WebSocket disconnected");
    };

    ws.onerror = (err) => {
      setError("WebSocket connection failed");
      console.error("Stream WebSocket error:", err);
    };
  }, [streamId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { frame, isConnected, error, reconnect: connect };
};
