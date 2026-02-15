import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardCheck, CalendarDays, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/tasks", label: "Tasks", icon: ClipboardCheck },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/activity", label: "Activity", icon: Activity },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around py-1 safe-bottom">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
        const isDashboard = item.to === "/" && location.pathname === "/";
        const active = item.to === "/" ? isDashboard : isActive;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors rounded-md",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
