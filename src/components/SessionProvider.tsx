"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import SessionExpiredModal from "./SessionExpiredModal";
import { useRouter } from "next/navigation";

interface SessionContextType {
  showSessionExpired: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession401() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession401 must be used within SessionProvider");
  }
  return context;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const showSessionExpired = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
    // Redirect to login with expired flag
    window.location.href = "/login?expired=true";
  };

  return (
    <SessionContext.Provider value={{ showSessionExpired }}>
      {children}
      <SessionExpiredModal isOpen={showModal} onConfirm={handleConfirm} />
    </SessionContext.Provider>
  );
}

// Global function that can be called from anywhere (including api.ts)
let globalShowSessionExpired: (() => void) | null = null;

export function setGlobalSessionExpiredHandler(handler: () => void) {
  globalShowSessionExpired = handler;
}

export function triggerSessionExpired() {
  if (globalShowSessionExpired) {
    globalShowSessionExpired();
  }
}
