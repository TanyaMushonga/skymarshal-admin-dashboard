"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Radio, Activity, Lock, Globe } from "lucide-react";

const slides = [
  {
    icon: <Shield className="w-12 h-12 text-blue-400" />,
    title: "Real-time Threat Neutralization",
    description:
      "Our advanced AI-driven algorithms identify and mitigate unauthorized drone activities within seconds, ensuring your airspace remains secure 24/7.",
  },
  {
    icon: <Activity className="w-12 h-12 text-emerald-400" />,
    title: "Predictive Analytics",
    description:
      "Leverage historical data and machine learning to predict potential security breaches before they occur, giving you the edge in aerial defense.",
  },
  {
    icon: <Globe className="w-12 h-12 text-indigo-400" />,
    title: "Global Operations",
    description:
      "Seamlessly manage and monitor multiple sites across the globe from a single, unified administrative dashboard with zero latency.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#05080f] text-white selection:bg-blue-500/30">
      {/* Left Column: Auth Forms */}
      <div className="flex flex-col p-8 lg:p-12 xl:p-20 justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Section */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-5 group">
              <div className="relative w-24 h-24 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                <Image
                  src="/skymarshal-logo.png"
                  alt="SkyMarshal Logo"
                  fill
                  className="object-contain transform group-hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tighter uppercase group-hover:text-blue-400 transition-colors leading-none">
                  SkyMarshal
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
                  Airspace Defense
                </span>
              </div>
            </Link>
          </div>

          {/* Children (Page Content) */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
              Restricted Access. All sessions are encrypted and logged under
              Federal Cyber Security Protocol 882-B.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Sliding Info (Desktop Only) */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#0a0f18] border-l border-white/5">
        {/* Tactical Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-bg.png"
            alt="Tactical Background"
            fill
            className="object-cover opacity-20 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#05080f] via-transparent to-[#05080f]/80" />
        </div>

        {/* Tactical Grid Background */}
        <div
          className="absolute inset-0 z-10 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-20">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
          <div className="w-full max-w-lg">
            <div className="relative h-[400px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 flex flex-col items-center text-center justify-center space-y-8 ${
                    index === currentSlide
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                    {slide.icon}
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed font-medium">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-3 mt-12">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    index === currentSlide
                      ? "w-8 bg-blue-500"
                      : "w-2 bg-slate-700 hover:bg-slate-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Status Badges */}
        <div className="absolute bottom-8 right-8 flex gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              System Online
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Radio className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
              Airspace Clear
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
