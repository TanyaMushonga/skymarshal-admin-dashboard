import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
async function refreshAccessToken(token: any) {
  try {
    console.log("Refreshing access token...");
    if (!token.refreshToken) {
      console.error("No refresh token available");
      throw new Error("No refresh token");
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh: token.refreshToken,
    });

    console.log("Token refresh successful");
    return {
      ...token,
      accessToken: response.data.access,
      refreshToken: response.data.refresh ?? token.refreshToken,
      accessTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      error: null,
    };
  } catch (error: any) {
    console.error(
      "Error refreshing access token:",
      error.response?.data || error.message,
    );
    return {
      ...token,
      error: "RefreshAccessTokenError",
      // Force expiration to trigger a re-login flow via middleware
      accessTokenExpires: Date.now() - 1000,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        try {
          const isVerification = !!credentials.code;
          const endpoint = isVerification
            ? "/auth/login/verify/"
            : "/auth/login/admin/";

          const payload = isVerification
            ? { email: credentials.email, code: credentials.code }
            : { email: credentials.email, password: credentials.password };

          console.log(
            `Attempting ${isVerification ? "2FA Verification" : "Login"} for:`,
            credentials.email,
          );
          const response = await axios.post(
            `${API_BASE_URL}${endpoint}`,
            payload,
          );

          const user = response.data;
          if (user["2fa_required"]) {
            console.log("2FA required for user:", credentials.email);
            throw new Error("2FA_REQUIRED");
          }

          if (user && user.access) {
            console.log("Authorize returning user object with tokens");
            return {
              ...(user.user || {}),
              id: user.user?.id || user.email || credentials.email,
              email: user.email || credentials.email,
              accessToken: user.access,
              refreshToken: user.refresh,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Login Authorization Error:", error);
          if (error.message === "2FA_REQUIRED") {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user && account) {
        console.log("JWT Callback - Initial Sign In");
        return {
          ...token,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          user: {
            id: (user as any).id,
            email: (user as any).email,
            first_name: (user as any).first_name,
            last_name: (user as any).last_name,
            role: (user as any).role,
            avatar: (user as any).avatar,
          },
        };
      }

      // Handle session updates
      if (trigger === "update" && session?.user) {
        console.log("JWT Callback - Manual Update Triggered");
        token.user = {
          ...(token.user as any),
          ...session.user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      console.log("JWT Callback - Token Expired, Refreshing");
      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user = token.user as any;
      session.error = token.error as string;
      if (!session.refreshToken)
        console.warn("Session Callback - Missing Refresh Token");
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET!,
};
