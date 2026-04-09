"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "right",
  className,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = 0;
    let left = 0;
    let transform = "";

    switch (position) {
      case "top":
        top = rect.top;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, -100%) translateY(-8px)";
        break;
      case "bottom":
        top = rect.bottom;
        left = rect.left + rect.width / 2;
        transform = "translate(-50%, 0) translateY(8px)";
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left;
        transform = "translate(-100%, -50%) translateX(-8px)";
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right;
        transform = "translate(0, -50%) translateX(8px)";
        break;
    }

    setCoords({ top, left, transform });
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
    setCoords(null);
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-card border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-card border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-card border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-card border-y-transparent border-l-transparent",
  };

  return (
    <div
      className={cn("relative flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && coords && (
        <div
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: coords.transform,
          }}
          className={cn(
            "z-[9999] px-3 py-1.5 text-xs font-semibold text-foreground bg-card border border-border rounded-md shadow-xl whitespace-nowrap animate-in fade-in zoom-in duration-200",
          )}
        >
          {content}
          <div
            className={cn(
              "absolute border-4 w-0 h-0",
              arrowClasses[position],
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
