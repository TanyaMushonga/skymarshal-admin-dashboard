"use client";

import { Search, Menu } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "../NotificationBell";
import React from "react";

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
        <NotificationBell />{" "}
        {/* Replaced bell button with NotificationBell component */}
        <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block"></div>
        <ProfileMenu />
      </div>
    </header>
  );
};

export default Header;
