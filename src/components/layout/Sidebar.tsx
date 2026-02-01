"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { ShieldAlert, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

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
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldAlert className="text-primary-foreground" size={24} />
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
        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
          <img
            src="https://picsum.photos/seed/admin/40/40"
            className="w-10 h-10 rounded-lg"
            alt="Admin"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">
              John Doe
            </p>
            <p className="text-xs text-muted-foreground truncate">
              System Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
