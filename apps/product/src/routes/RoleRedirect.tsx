import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ROLE_HOME: Record<string, string> = {
  institute_admin: "/app/admin",
  faculty: "/app/faculty",
  student: "/app/student",
  super_admin: "/app/super-admin",
  parent: "/app/student",
  support: "/app/admin",
};

export default function RoleRedirect() {
  const { profile } = useAuth();
  const target = profile ? ROLE_HOME[profile.role] ?? "/app/student" : "/login";
  return <Navigate to={target} replace />;
}
