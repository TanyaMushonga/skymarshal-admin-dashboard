"use client";

import React from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Sign In</h1>
        <p className="text-slate-400 font-medium">
          Authorized personnel only. Enter your credentials to access the
          SkyMarshal Command Center.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Official Email
          </label>
          <div className="relative group">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="email"
              placeholder="name@skymarshal.agency"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Security Key
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
            >
              Reset Key?
            </Link>
          </div>
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-2 cursor-pointer group w-fit">
          <input
            type="checkbox"
            id="remember"
            className="w-5 h-5 rounded-lg border-slate-800 bg-slate-900 checked:bg-blue-600 transition-all cursor-pointer accent-blue-600"
          />
          <label
            htmlFor="remember"
            className="text-sm font-bold text-slate-400 group-hover:text-slate-300 transition-colors cursor-pointer"
          >
            Remember this terminal for 30 days
          </label>
        </div>

        <Link
          href="/dashboard"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
        >
          AUTHENTICATE
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </form>

      <div className="text-center">
        <p className="text-slate-500 font-medium">
          New operative?{" "}
          <Link
            href="/register"
            className="text-blue-500 font-bold hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/30"
          >
            Request an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
