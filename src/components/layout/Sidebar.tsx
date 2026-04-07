"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { Zap, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Tooltip from "../ui/Tooltip";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={`
      ${isCollapsed ? "w-20" : "w-64"} h-screen bg-card/80 backdrop-blur-xl border-r border-border flex flex-col fixed left-0 top-0 z-60
      transition-all duration-300 lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div
        className={`p-6 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-primary/20">
            S
          </div>
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-400">
              SkyMarshal
            </h1>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const content = (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }
                ${isCollapsed ? "justify-center px-0" : ""}
              `}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="font-semibold text-sm">{item.label}</span>
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path} content={item.label} position="right">
                {content}
              </Tooltip>
            );
          }

          return content;
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={onToggleCollapse}
          className={`
            w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all
            ${isCollapsed ? "" : "gap-2"}
          `}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

