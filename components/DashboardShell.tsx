"use client";

import React, { useState } from "react";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
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
};

export default DashboardShell;
