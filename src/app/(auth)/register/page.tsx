"use client";

import React from "react";
import { Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Join Force</h1>
        <p className="text-muted-foreground font-medium">
          Initialize your profile to begin coordinating aerial defense
          operations. All accounts require admin approval.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Full Name
          </label>
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Officer Name"
              className="w-full bg-muted/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
              required
            />
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Set Security Key
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Confirm Key
            </label>
            <div className="relative group">
              <ShieldCheck
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2 group cursor-pointer">
          <input
            type="checkbox"
            id="terms"
            className="w-5 h-5 mt-0.5 rounded-lg border-border bg-muted checked:bg-primary transition-all cursor-pointer accent-primary"
            required
          />
          <label
            htmlFor="terms"
            className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer leading-relaxed"
          >
            I agree to the <span className="text-primary">Code of Conduct</span>{" "}
            and acknowledge that all actions will be monitored for security
            purposes.
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
        >
          INITIALIZE ENROLLMENT
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </form>

      <div className="text-center">
        <p className="text-muted-foreground font-medium">
          Already in force?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
          >
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
}
