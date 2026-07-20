import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, Calendar, GraduationCap, LogOut, Settings, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";

const NAV_BY_ROLE: Record<string, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  institute_admin: [
    { to: "/app/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/admin/courses", label: "Courses", icon: BookOpen },
    { to: "/app/admin/faculty", label: "Faculty", icon: GraduationCap },
    { to: "/app/admin/students", label: "Students", icon: Users },
    { to: "/app/admin/batches", label: "Batches", icon: Calendar },
    { to: "/app/admin/settings", label: "Settings", icon: Settings },
  ],
  faculty: [
    { to: "/app/faculty", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/faculty/courses", label: "My Courses", icon: BookOpen },
    { to: "/app/faculty/live", label: "Live Classes", icon: Calendar },
  ],
  student: [
    { to: "/app/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/student/courses", label: "My Courses", icon: BookOpen },
  ],
  super_admin: [{ to: "/app/super-admin", label: "Institutes", icon: Building2 }],
};

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const { tenant } = useTenant();
  const nav = profile ? NAV_BY_ROLE[profile.role] ?? [] : [];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
        <div className="border-b px-4 py-4">
          <p className="truncate font-semibold">
            {profile?.role === "super_admin" ? "EduSaaS Platform" : tenant?.name ?? "EduSaaS"}
          </p>
          <p className="text-xs text-muted-foreground">{profile?.role.replace("_", " ")}</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split("/").length === 3}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-end border-b px-6 py-2">
          <NotificationBell />
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
