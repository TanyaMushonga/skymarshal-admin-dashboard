"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/auth-schemas";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Authenticate with backend
      await api.post("/auth/login/", data);

      // On success, redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        // Handle Django-style errors (detail or specific field errors)
        if (err.data.non_field_errors) {
          setError(
            Array.isArray(err.data.non_field_errors)
              ? err.data.non_field_errors[0]
              : err.data.non_field_errors,
          );
        } else if (err.data.detail) {
          setError(err.data.detail);
        } else {
          setError("Access denied. Please check your credentials.");
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
        <h1 className="text-4xl font-black tracking-tight mb-3">Sign In</h1>
        <p className="text-muted-foreground font-medium">
          Authorized personnel only. Enter your credentials to access the
          SkyMarshal Command Center.
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
              placeholder="••••••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              AUTHENTICATE
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
