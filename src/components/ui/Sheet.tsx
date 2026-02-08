"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  side?: "right" | "bottom";
}

export default function Sheet({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-md",
  side = "right",
}: SheetProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRight = side === "right";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isRight ? "justify-end" : "items-end justify-center"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity opacity-100"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className={`relative z-50 bg-background shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${
          isRight
            ? `h-full w-full ${width} border-l border-border animate-in slide-in-from-right`
            : `w-full max-w-4xl h-[80vh] rounded-t-2xl border-t border-border animate-in slide-in-from-bottom`
        }`}
      >
        {!isRight && (
          <div className="w-full flex justify-center pt-4">
            <div className="w-12 h-1.5 bg-muted rounded-full" />
          </div>
        )}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all bg-muted/30"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
