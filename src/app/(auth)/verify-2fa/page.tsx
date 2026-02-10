"use client";

import React, { useState, Suspense } from "react";
import { ShieldCheck, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";

const verifySchema = z.object({
  code: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(8, "Code too long"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyFormValues) => {
    if (!email) {
      setError("Session context lost. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        code: data.code,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid or expired verification code."
            : result.error,
        );
      } else {
        toast.success("Identity verified. Access granted.");
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-2fa/", { email });
      toast.success("A new tactical code has been dispatched.");
    } catch (err) {
      toast.error("Code dispatch failed. Please try again later.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Login
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-3">
          Two-Factor Authentication
        </h1>
        <p className="text-muted-foreground font-medium">
          A secure verification code has been sent to{" "}
          <span className="text-foreground font-bold">{email}</span>. Enter it
          below to authorize this tactical terminal.
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
            Verification Code
          </label>
          <div className="relative group">
            <ShieldCheck
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                errors.code
                  ? "text-destructive"
                  : "text-muted-foreground group-focus-within:text-primary"
              }`}
              size={18}
            />
            <input
              {...register("code")}
              type="text"
              placeholder="000000"
              className={`w-full bg-muted/50 border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary/50 transition-all font-medium tracking-[0.5em] text-center ${
                errors.code
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border focus:ring-primary/20"
              }`}
            />
          </div>
          {errors.code && (
            <span className="text-[10px] text-destructive font-bold ml-1">
              {errors.code.message}
            </span>
          )}
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
              VERIFY IDENTITY
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
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-primary font-bold hover:text-primary/80 transition-colors underline underline-offset-4 decoration-primary/30"
          >
            Request New Code
          </button>
        </p>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }
    >
      <Verify2FAContent />
    </Suspense>
  );
}
