import React from "react";
import {
  BookOpen,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { User, signOut, auth } from "../lib/firebase";
import { ViewTab } from "../types";

interface NavbarProps {
  user: User;
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  journalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onSelectTab,
  journalsCount,
}) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#06080e]/85 backdrop-blur-xl border-b border-white/[0.08] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab("active")}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#06080e] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <span className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5">
                  Personal Gemini Journal
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    3.6 Flash
                  </span>
                </span>
                <span className="text-xs text-slate-400 hidden sm:block font-mono">
                  User-Isolated · Zero Cross-Leakage
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-active-journal"
              onClick={() => onSelectTab("active")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === "active"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              Active Session
            </button>

            <button
              id="nav-history"
              onClick={() => onSelectTab("history")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === "history"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              Journal History
              {journalsCount > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-900 text-sky-300 border border-white/[0.08]">
                  {journalsCount}
                </span>
              )}
            </button>

            <button
              id="nav-reflection-engine"
              onClick={() => onSelectTab("reflection")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === "reflection"
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Growth Timeline
            </button>

            <button
              id="nav-security-spec"
              onClick={() => onSelectTab("security")}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === "security"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(52,211,153,0.3)] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security Audit
            </button>
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-6 h-6 rounded-full ring-1 ring-sky-400/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate hidden sm:inline">
                {user.displayName || user.email?.split("@")[0] || "Authenticated"}
              </span>
            </div>

            <button
              id="btn-logout"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900/80 rounded-xl transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab bar */}
      <div className="md:hidden flex items-center justify-around py-2.5 border-t border-white/[0.08] bg-[#06080e]/95 text-xs">
        <button
          onClick={() => onSelectTab("active")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            currentTab === "active" ? "text-sky-400 font-semibold" : "text-slate-400"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Active
        </button>
        <button
          onClick={() => onSelectTab("history")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            currentTab === "history" ? "text-sky-400 font-semibold" : "text-slate-400"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          History ({journalsCount})
        </button>
        <button
          onClick={() => onSelectTab("reflection")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            currentTab === "reflection" ? "text-indigo-400 font-semibold" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Timeline
        </button>
        <button
          onClick={() => onSelectTab("security")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
            currentTab === "security" ? "text-emerald-400 font-semibold" : "text-slate-400"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security
        </button>
      </div>
    </header>
  );
};
