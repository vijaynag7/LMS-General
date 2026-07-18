import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@edusaas/shared";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

/**
 * Resolves the active tenant from the URL. Production: subdomain
 * (institute.eduSaaS.app). Local dev: a ?tenant=slug query param, since
 * *.localhost subdomains are awkward to set up — falls back to
 * VITE_DEFAULT_TENANT_SLUG (the seeded "demo" tenant) if neither is present.
 */
function resolveTenantSlug(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery) return fromQuery;

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (!isLocal) {
    const parts = host.split(".");
    if (parts.length > 2) return parts[0];
  }

  return import.meta.env.VITE_DEFAULT_TENANT_SLUG ?? "demo";
}

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
}

const TenantContext = React.createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const slug = React.useMemo(resolveTenantSlug, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    if (data?.branding && typeof data.branding === "object" && "brandColor" in data.branding) {
      const color = (data.branding as { brandColor?: string }).brandColor;
      if (color) document.documentElement.style.setProperty("--brand", color);
    }
  }, [data]);

  return (
    <TenantContext.Provider value={{ tenant: data ?? null, isLoading, error: error as Error | null }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = React.useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within a TenantProvider");
  return ctx;
}
