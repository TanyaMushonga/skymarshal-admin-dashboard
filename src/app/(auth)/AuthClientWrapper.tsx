"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Activity } from "lucide-react";

function AuthRedirectCheck({ isExpired }: { isExpired: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      status === "authenticated" &&
      !session?.error &&
      session?.accessToken &&
      !isExpired
    ) {
      router.replace("/dashboard");
    }
  }, [status, session, router, isExpired]);

  return null;
}

function AuthContentWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {children}
      <AuthRedirectCheck isExpired={isExpired} />
    </div>
  );
}

export function AuthSuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense 
      fallback={
        <div className="flex justify-center py-12">
          <Activity className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <AuthContentWrapper>{children}</AuthContentWrapper>
    </Suspense>
  );
}
