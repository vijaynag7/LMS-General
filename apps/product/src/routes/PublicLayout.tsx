import { Link, Outlet } from "react-router-dom";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { buttonVariants } from "@/components/ui/button";

export default function PublicLayout() {
  const { tenant, isLoading } = useTenant();
  const { session } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link to="/" className="font-semibold">
          {isLoading ? "…" : tenant?.name ?? "Institute not found"}
        </Link>
        <div className="flex items-center gap-2">
          {session ? (
            <Link to="/app" className={buttonVariants({ size: "sm", variant: "brand" })}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonVariants({ size: "sm", variant: "ghost" })}>
                Sign in
              </Link>
              <Link to="/signup" className={buttonVariants({ size: "sm", variant: "brand" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
