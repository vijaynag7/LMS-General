import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@edusaas/shared";

export function RequireAuth() {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoading />;
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireRole({ allow }: { allow: Role[] }) {
  const { profile, isLoading } = useAuth();

  if (isLoading) return <FullPageLoading />;
  if (!profile || !allow.includes(profile.role)) return <Navigate to="/app" replace />;
  return <Outlet />;
}

export function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
