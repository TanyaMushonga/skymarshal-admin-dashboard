"use client";

import React from "react";
import { Bell, Search, Settings, HelpCircle, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search fleet..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Icon Only */}
        <button className="md:hidden p-2 text-slate-400 hover:text-white">
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="hidden sm:block p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-all">
          <HelpCircle size={20} />
        </button>
        <button className="hidden sm:block p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-all">
          <Settings size={20} />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
