"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/auth-schemas";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Register with backend
      await api.post("/auth/register/", data);

      // On success, redirect to login (or dashboard depending on requirements)
      router.push("/login?registered=true");
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle Django-style errors
        if (err.data.non_field_errors) {
          setError(
            Array.isArray(err.data.non_field_errors)
              ? err.data.non_field_errors[0]
              : err.data.non_field_errors,
          );
        } else if (err.data.detail) {
          setError(err.data.detail);
        } else if (typeof err.data === "object") {
          // If there are specific field errors not caught by Zod (e.g., email already exists)
          const firstError = Object.values(err.data)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError("Registration failed. Please try again.");
        }
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

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
            Full Name
          </label>
          <div className="relative group">
            <User
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                errors.fullName
                  ? "text-destructive"
                  : "text-muted-foreground group-focus-within:text-primary"
              }`}
              size={18}
            />
            <input
              {...register("fullName")}
              type="text"
              placeholder="Officer Name"
              className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                errors.fullName
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
          </div>
          {errors.fullName && (
            <span className="text-[10px] text-destructive font-bold ml-1">
              {errors.fullName.message}
            </span>
          )}
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
              Set Security Key
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.password
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.password
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.password.message}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Confirm Key
            </label>
            <div className="relative group">
              <ShieldCheck
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                  errors.confirmPassword
                    ? "text-destructive"
                    : "text-muted-foreground group-focus-within:text-primary"
                }`}
                size={18}
              />
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium ${
                  errors.confirmPassword
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-[10px] text-destructive font-bold ml-1">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
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
