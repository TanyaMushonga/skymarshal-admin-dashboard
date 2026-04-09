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
        className={`p-6 flex flex-col gap-4 ${
          isCollapsed ? "items-center" : "items-start"
        }`}
      >
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start group">
            <div className={`flex flex-col ${isCollapsed ? "items-center" : "items-start"}`}>
              <span className={`font-black tracking-tighter leading-none text-foreground ${isCollapsed ? "text-xl" : "text-2xl"}`}>
                SKY
              </span>
              <span className={`font-bold tracking-[0.2em] leading-none text-primary ${isCollapsed ? "text-[8px]" : "text-[10px]"} -mt-1`}>
                MARSHAL
              </span>
            </div>
          </Link>
          
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-foreground/5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all border border-border/50 shadow-sm"
              title="Collapse Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 shadow-lg shadow-primary/10"
            title="Expand Sidebar"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {!isCollapsed && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
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

      {/* Footer info or profile can remain here if needed, but the toggle moved to top */}
      {!isCollapsed && session?.user && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {session.user.name?.[0] || session.user.email?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-foreground">
                {session.user.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate opacity-70">
                Authorized Personnel
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

