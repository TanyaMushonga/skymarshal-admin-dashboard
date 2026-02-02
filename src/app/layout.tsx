import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SkyMarshal Admin Dashboard",
  description: "Advanced Drone Management Systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
