"use client";

import React, { useState } from "react";
import { Mail, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/auth-schemas";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      force_number: "",
      unit_id: "",
      phone_number: "",
      is_certified_pilot: false,
      pilot_license_number: "",
      is_2fa_enabled: true,
      terms: false,
    },
  });

  const isCertifiedPilot = watch("is_certified_pilot");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post("users/", data);

      toast.success("Account initialized. Pending authorization...", {
        description: "Redirecting to secure login...",
      });

      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight mb-3">Join Force</h1>
        <p className="text-muted-foreground font-medium">
          Initialize your profile to begin coordinating aerial defense
          operations. All accounts require admin approval.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              First Name
            </label>
            <div className="relative group">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.first_name
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("first_name")}
                type="text"
                placeholder="First Name"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.first_name
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.first_name && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.first_name.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Last Name
            </label>
            <div className="relative group">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.last_name
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("last_name")}
                type="text"
                placeholder="Last Name"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.last_name
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.last_name && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.last_name.message}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Official Email
          </label>
          <div className="relative group">
            <Mail
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                errors.email
                  ? "text-destructive"
                  : "text-muted-foreground group-focus-within:text-primary"
              }`}
              size={18}
            />
            <input
              {...register("email")}
              type="email"
              placeholder="name@skymarshal.agency"
              className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                errors.email
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
          </div>
          {errors.email && (
            <span className="text-[10px] text-destructive font-bold ml-1">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Force Number
            </label>
            <div className="relative group">
              <ShieldCheck
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.force_number
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("force_number")}
                type="text"
                placeholder="Force Number"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.force_number
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.force_number && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.force_number.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Unit ID
            </label>
            <div className="relative group">
              <ShieldCheck
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.unit_id
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("unit_id")}
                type="text"
                placeholder="Unit ID"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.unit_id
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.unit_id && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.unit_id.message}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Phone Number
          </label>
          <div className="relative group">
            <input
              {...register("phone_number")}
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={`w-full bg-muted/50 border rounded-2xl py-4 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                errors.phone_number
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
          </div>
          {errors.phone_number && (
            <span className="text-[10px] text-destructive font-bold ml-1">
              {errors.phone_number.message}
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 py-2 cursor-pointer">
            <input
              {...register("is_certified_pilot")}
              type="checkbox"
              id="is_certified_pilot"
              className="w-5 h-5 rounded-lg border bg-muted checked:bg-primary transition-all cursor-pointer accent-primary"
            />
            <label
              htmlFor="is_certified_pilot"
              className="text-sm font-medium cursor-pointer"
            >
              I am a Certified Pilot
            </label>
          </div>

          {isCertifiedPilot && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Pilot License Number
              </label>
              <div className="relative group">
                <input
                  {...register("pilot_license_number")}
                  type="text"
                  placeholder="License Number"
                  className={`w-full bg-muted/50 border rounded-2xl py-4 pl-4 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                    errors.pilot_license_number
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-border focus:ring-primary/20"
                  }`}
                />
              </div>
              {errors.pilot_license_number && (
                <span className="text-[10px] text-destructive font-bold ml-1">
                  {errors.pilot_license_number.message}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 py-2 group cursor-pointer">
          <input
            {...register("terms")}
            type="checkbox"
            id="terms"
            className={`w-5 h-5 mt-0.5 rounded-lg border bg-muted checked:bg-primary transition-all cursor-pointer accent-primary ${
              errors.terms ? "border-destructive" : "border-border"
            }`}
          />
          <label
            htmlFor="terms"
            className={`text-xs font-bold transition-colors cursor-pointer leading-relaxed ${
              errors.terms
                ? "text-destructive"
                : "text-muted-foreground group-hover:text-foreground"
            }`}
          >
            I agree to the <span className="text-primary">Code of Conduct</span>{" "}
            and acknowledge that all actions will be monitored for security
            purposes.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              INITIALIZE ENROLLMENT
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
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
