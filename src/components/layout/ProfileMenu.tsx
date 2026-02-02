"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Sun, Moon, Monitor, Settings } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (session?.refreshToken) {
        await api.post("/auth/logout/", { refresh: session.refreshToken });
      }
      toast.info("Logging out...");
    } catch (error) {
      console.error("Logout API failed", error);
      toast.error("Server logout failed, clearing local session.");
    } finally {
      // Always sign out of the client session
      await signOut({ callbackUrl: "/login" });
    }
  };

  const getInitials = (email?: string | null) => {
    if (!email) return "OP";
    return email.substring(0, 2).toUpperCase();
  };

  const userEmail = session?.user?.email || "operative@skymarshal.agency";
  // Assuming we might have name in future or custom session type, fallback to email part
  const userName = userEmail.split("@")[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-xl transition-colors border border-transparent hover:border-border"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
          {getInitials(userEmail)}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-bold leading-none">{userName}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">
            Operative
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-border/50 mb-2">
            <p className="font-bold text-sm truncate">{userEmail}</p>
            <p className="text-xs text-muted-foreground">
              Authenticated Session
            </p>
          </div>

          <div className="space-y-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
            >
              <User size={16} />
              Operative Profile
            </Link>

            <div className="px-3 py-2">
              <p className="text-[10px] uppercase font-black text-muted-foreground mb-2 ml-1">
                Interface Theme
              </p>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    theme === "light"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Sun size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    theme === "dark"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Moon size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    theme === "system"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Monitor size={16} className="mb-1" />
                  <span className="text-[10px] font-bold">Auto</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-border/50 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            >
              <LogOut size={16} />
              Terminate Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
