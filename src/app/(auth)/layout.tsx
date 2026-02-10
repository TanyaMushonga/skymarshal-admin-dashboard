"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Radio, Activity, Lock, Globe } from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const slides = [
  {
    title: "Real-time Threat Neutralization",
    description:
      "Our advanced AI-driven algorithms identify and mitigate unauthorized drone activities within seconds, ensuring your airspace remains secure 24/7.",
  },
  {
    title: "Predictive Analytics",
    description:
      "Leverage historical data and machine learning to predict potential security breaches before they occur, giving you the edge in aerial defense.",
  },
  {
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Only redirect if authenticated, no error, has token, and NOT redirected due to expiry
    if (
      status === "authenticated" &&
      !session?.error &&
      session?.accessToken &&
      !isExpired
    ) {
      router.replace("/dashboard");
    }
  }, [status, session, router, isExpired]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (
    status === "loading" ||
    (status === "authenticated" &&
      !session?.error &&
      session?.accessToken &&
      !isExpired)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground selection:bg-primary/30">
      {/* Left Column: Auth Forms */}
      <div className="flex flex-col p-8 lg:p-12 xl:p-20 justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Children (Page Content) */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-loose">
              Restricted Access. All sessions are monitored and recorded in
              accordance with the Cyber and Data Protection Act [Chapter 12:07]
              of Zimbabwe.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Sliding Info (Desktop Only) */}
      <div className="hidden lg:flex relative overflow-hidden bg-card border-l border-border">
        {/* Tactical Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/auth-bg.png"
            alt="Tactical Background"
            fill
            className="object-cover opacity-20 mix-blend-luminosity grayscale contrast-125"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/80" />
        </div>

        {/* Tactical Grid Background */}
        <div
          className="absolute inset-0 z-10 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Abstract Background Design */}
        <div className="absolute inset-0 z-20">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Repositioned Sliding Text (Bottom-Left) */}
        <div className="absolute bottom-16 left-16 right-16 z-30 flex flex-col items-start text-left">
          <div className="w-full max-w-lg">
            <div className="relative h-[180px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 flex flex-col items-start justify-end space-y-4 ${
                    index === currentSlide
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed font-medium">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-start gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-500 rounded-full ${
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Status Badges */}
        <div className="absolute bottom-8 right-8 flex gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 z-30">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
              System Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
