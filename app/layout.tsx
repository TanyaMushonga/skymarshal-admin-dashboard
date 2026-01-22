import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-slate-900 text-slate-200">
        {children}
      </body>
    </html>
  );
}
