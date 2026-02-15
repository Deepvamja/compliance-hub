import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardCheck, Shield, ChevronLeft, ChevronRight, CalendarDays, Activity, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/tasks", label: "Tasks", icon: ClipboardCheck },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activity", label: "Activity Log", icon: Activity },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        <Shield className="h-6 w-6 text-sidebar-ring shrink-0" />
        {!collapsed && (
          <span className="text-sidebar-primary font-bold text-lg tracking-tight">
            ComplianceHub
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          const isDashboard = item.to === "/" && location.pathname === "/";
          const active = item.to === "/" ? isDashboard : isActive;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="flex items-center gap-3 px-5 py-3 text-sm text-sidebar-muted hover:text-sidebar-primary transition-colors border-t border-sidebar-border"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
