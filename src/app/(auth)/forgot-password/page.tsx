"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle2 className="text-emerald-500" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Check Your Intel
          </h1>
          <p className="text-slate-400 font-medium leading-relaxed">
            We have dispatched a recovery link to your official email. Please
            verify your identity within the next 15 minutes.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest hover:text-blue-400 transition-colors"
          >
            Back to Command Center
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="text-blue-500" size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">
          Recover Account
        </h1>
        <p className="text-slate-400 font-medium">
          Locked out of the system? Enter your official email address and we'll
          verify your credentials to reset your security key.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
        >
          REQUEST RECOVERY
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </form>

      <div className="text-center">
        <p className="text-slate-500 font-medium">
          Remembered your key?{" "}
          <Link
            href="/login"
            className="text-blue-500 font-bold hover:text-blue-400 transition-colors underline underline-offset-4 decoration-blue-500/30"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
