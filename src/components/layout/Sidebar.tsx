"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { Zap, X } from "lucide-react";
import { useSession } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={`
      w-64 h-screen bg-card/80 backdrop-blur-xl border-r border-border flex flex-col fixed left-0 top-0 z-60
      transition-transform duration-300 lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-primary via-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group">
            <span className="text-primary-foreground font-black text-xl tracking-tighter group-hover:scale-110 transition-transform">
              SM
            </span>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-400">
            SkyMarshal
          </h1>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                }
              `}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
            {(session?.user as any)?.avatar ? (
              <img
                src={(session?.user as any).avatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              (session?.user as any)?.first_name?.charAt(0) ||
              (session?.user as any)?.email?.charAt(0).toUpperCase() ||
              "OP"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold truncate text-foreground leading-tight">
              {(session?.user as any)?.first_name &&
              (session?.user as any)?.last_name
                ? `${(session?.user as any).first_name} ${(session?.user as any).last_name}`
                : session?.user?.name ||
                  session?.user?.email?.split("@")[0] ||
                  "Operative"}
            </p>
            <p className="text-xs text-muted-foreground truncate mb-1.5 leading-tight">
              {session?.user?.email}
            </p>
            <div
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block
              ${(session?.user as any)?.role?.toLowerCase() === "admin" ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border"}
            `}
            >
              {(session?.user as any)?.role || "Operative"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
