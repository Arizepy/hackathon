import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import { StaffMemberRole } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  FlaskConical,
  TrendingDown,
  Clock,
  MapPin,
  Stethoscope,
  Users,
  FileHeart,
  Shield,
  Globe,
  BriefcaseMedical,
  ShieldAlert,
  Info,
  CalendarDays
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Clinical Care",
    items: [
      { href: "/patients", label: "Patient Records", icon: FileHeart },
      { href: "/training", label: "First Aid Training", icon: Stethoscope },
    ]
  },
  {
    title: "Operations",
    items: [
      { href: "/shifts", label: "Staff & Shifts", icon: CalendarDays },
      { href: "/facilities", label: "Facility Hours", icon: Clock },
    ]
  },
  {
    title: "Logistics",
    items: [
      { href: "/inventory", label: "Inventory & Analytics", icon: FlaskConical },
      { href: "/stock-duration", label: "Stock Runway", icon: TrendingDown },
      { href: "/stations", label: "Stations Locator", icon: MapPin },
    ]
  }
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { role, setRole } = useRole();

  // Find active label for header
  let activeLabel = "HealthAccess";
  for (const group of NAV_GROUPS) {
    const matched = group.items.find((item) => {
      if (item.href === "/") return location === "/";
      return location.startsWith(item.href);
    });
    if (matched) {
      activeLabel = matched.label;
      break;
    }
  }

  // Get active role configurations
  const roleConfigs = [
    { id: "admin" as StaffMemberRole, label: "Admin", icon: Shield, color: "text-purple-500", desc: "Facility Admin" },
    { id: "staff" as StaffMemberRole, label: "Staff", icon: Stethoscope, color: "text-emerald-500", desc: "Medical Staff" },
    { id: "public" as StaffMemberRole, label: "Public", icon: Globe, color: "text-blue-500", desc: "Public Guest" },
  ];

  const currentRoleConfig = roleConfigs.find(c => c.id === role) || roleConfigs[0];

  return (
    <div className="flex min-h-[100dvh] w-full bg-background font-sans">
      
      {/* DOUBLE SIDEBAR DESIGN */}
      <aside className="hidden md:flex flex-row flex-shrink-0 h-screen sticky top-0 overflow-hidden z-20 shadow-lg">
        
        {/* 1. Primary Mini-Sidebar (70px) */}
        <div className="w-[70px] bg-[#111422] text-white flex flex-col items-center py-6 justify-between border-r border-[#1a1e35]/35">
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-950/20">
              <BriefcaseMedical className="w-5.5 h-5.5 text-white" />
            </div>
            
            {/* Role switchers represented by premium icons */}
            <div className="flex flex-col gap-4 w-full px-2 items-center">
              <div className="w-full text-center text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1">
                Role
              </div>
              {roleConfigs.map((config) => {
                const isSelected = role === config.id;
                const IconComponent = config.icon;
                return (
                  <button
                    key={config.id}
                    onClick={() => setRole(config.id)}
                    title={`Switch to ${config.label} View`}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-300 group cursor-pointer",
                      isSelected
                        ? "bg-[#252a42] text-emerald-400 shadow-sm border border-emerald-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute left-0 w-1 h-5 bg-emerald-400 rounded-r-md" />
                    )}
                    <IconComponent className="w-5 h-5" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-16 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {config.label} View
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Profile avatar info at bottom */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center font-bold text-xs uppercase border border-slate-600/40 text-slate-300">
              {role.charAt(0)}
            </div>
          </div>
        </div>

        {/* 2. Secondary Menu Sidebar (210px) */}
        <div className="w-[210px] bg-[#171a2c] text-slate-300 flex flex-col justify-between border-r border-[#1f243f]/40">
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header / Sub-station name */}
            <div className="h-16 flex flex-col justify-center px-5 border-b border-[#222846]/40">
              <span className="font-serif text-sm font-bold text-white tracking-wide leading-none">
                HealthAccess
              </span>
              <span className="text-[11px] text-slate-400 mt-1 font-sans">
                {role === "public" ? "Community Portal" : "Riverside Clinic"}
              </span>
            </div>

            {/* Nav Groups */}
            <nav className="flex-1 py-6 px-3 space-y-5 overflow-y-auto custom-scrollbar">
              {NAV_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    {group.title}
                  </span>
                  {group.items.map((item) => {
                    const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
                    const ItemIcon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group text-sm",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm"
                              : "hover:bg-[#20253e]/40 hover:text-white"
                          )}
                        >
                          <ItemIcon className={cn("w-4 h-4 shrink-0 transition-colors", 
                            isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                          )} />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Active view label banner at the bottom */}
          <div className="p-3 border-t border-[#222846]/40 bg-[#121524]">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-slate-400 font-medium">
                View: <span className="text-white capitalize">{role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0 bg-[#F9F8F3]">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border/40 bg-white/75 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#1A1F36] tracking-tight">
              {activeLabel}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Role indicator in Header */}
             <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase bg-[#F9F8F3]", currentRoleConfig.color)}>
                  <currentRoleConfig.icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-none pr-1">
                  <p className="text-xs font-semibold text-[#1A1F36] capitalize">{role} View</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{currentRoleConfig.desc}</p>
                </div>
             </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
