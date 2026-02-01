"use client";

import React from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Sign In</h1>
        <p className="text-muted-foreground font-medium">
          Authorized personnel only. Enter your credentials to access the
          SkyMarshal Command Center.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Official Email
          </label>
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="email"
              placeholder="name@skymarshal.agency"
              className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Security Key
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
            >
              Reset Key?
            </Link>
          </div>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-2 cursor-pointer group w-fit">
          <input
            type="checkbox"
            id="remember"
            className="w-5 h-5 rounded-lg border-border bg-muted checked:bg-primary transition-all cursor-pointer accent-primary"
          />
          <label
            htmlFor="remember"
            className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
          >
            Remember this terminal for 30 days
          </label>
        </div>

        <Link
          href="/dashboard"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
        >
          AUTHENTICATE
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </form>

      <div className="text-center">
        <p className="text-muted-foreground font-medium">
          New operative?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
          >
            Request an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
