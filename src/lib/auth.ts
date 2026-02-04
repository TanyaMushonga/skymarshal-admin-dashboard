import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
      refresh: token.refreshToken,
    });

    return {
      ...token,
      accessToken: response.data.access,
      // Fallback to old refresh token if new one isn't provided
      refreshToken: response.data.refresh ?? token.refreshToken,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // Assuming 1 hour, adjust based on your Django settings
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          console.log("Attempting login for:", credentials.email);
          const response = await axios.post(
            `${API_BASE_URL}/auth/login/admin/`,
            {
              email: credentials.email,
              password: credentials.password,
            },
          );

          const user = response.data;
          console.log("Login Response Data Keys:", Object.keys(user));
          if (user.refresh) console.log("Refresh token present in response");
          else console.log("Refresh token MISSING in response");

          if (user) {
            console.log("Authorize returning user object with tokens");
            return {
              ...user.user,
              accessToken: user.access,
              refreshToken: user.refresh,
            };
          }
          return null;
        } catch (error) {
          console.error("Login Authorization Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        console.log("JWT Callback - Initial Sign In");
        console.log("User object keys:", Object.keys(user));
        return {
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
          user,
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
