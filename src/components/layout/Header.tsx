"use client";

import React from "react";
import { Bell, Search, Settings, HelpCircle, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="h-16 bg-background/50 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search fleet..."
              className="w-full bg-muted/50 border border-border/50 rounded-lg py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Icon Only */}
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <button className="hidden sm:block p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all">
          <HelpCircle size={20} />
        </button>
        <button className="hidden sm:block p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all">
          <Settings size={20} />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
