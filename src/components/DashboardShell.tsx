"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import {
  SessionProvider,
  useSession401,
  setGlobalSessionExpiredHandler,
} from "./SessionProvider";

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShellInner({ children }: DashboardShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { showSessionExpired } = useSession401();

  // Register global handler on mount
  useEffect(() => {
    setGlobalSessionExpiredHandler(showSessionExpired);
  }, [showSessionExpired]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-55 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={`flex-1 flex flex-col h-screen transition-all duration-300 lg:ml-64`}
      >
        <Header onMenuClick={toggleSidebar} />

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <SessionProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </SessionProvider>
  );
};

export default DashboardShell;
