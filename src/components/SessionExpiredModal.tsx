"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export default function SessionExpiredModal({
  isOpen,
  onConfirm,
}: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card border border-border shadow-2xl rounded-xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 rounded-full">
            <AlertTriangle className="text-amber-500" size={24} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Session Expired</h2>
        </div>

        <p className="text-base text-muted-foreground mb-6">
          Your session has expired due to inactivity. Please log in again to
          continue using the application.
        </p>

        <button
          onClick={onConfirm}
          className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
