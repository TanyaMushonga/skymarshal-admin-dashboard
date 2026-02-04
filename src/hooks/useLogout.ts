import { signOut, useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCallback } from "react";

export const useLogout = () => {
  const { data: session } = useSession();

  const logout = useCallback(async () => {
    try {
      if (session?.refreshToken) {
        await api.post("/auth/logout/", { refresh: session.refreshToken });
      }
      toast.info("Logging out...");
    } catch (error) {
      console.error("Logout API failed", error);
      toast.error("Server logout failed, clearing local session.");
    } finally {
      // Always sign out of the client session
      await signOut({ callbackUrl: "/login" });
    }
  }, [session]);

  return { logout };
};
