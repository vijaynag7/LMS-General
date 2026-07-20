import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@edusaas/shared";

type TenantStatus = Database["public"]["Enums"]["tenant_status"];

export type TenantWithCounts = Database["public"]["Tables"]["tenants"]["Row"] & {
  studentCount: number;
  courseCount: number;
};

export function usePlatformTenants() {
  return useQuery({
    queryKey: ["platform", "tenants"],
    queryFn: async () => {
      const [{ data: tenants, error: tenantsError }, { data: profiles, error: profilesError }, { data: courses, error: coursesError }] =
        await Promise.all([
          supabase.from("tenants").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
          supabase.from("profiles").select("tenant_id, role").eq("role", "student").is("deleted_at", null),
          supabase.from("courses").select("tenant_id").is("deleted_at", null),
        ]);
      if (tenantsError) throw tenantsError;
      if (profilesError) throw profilesError;
      if (coursesError) throw coursesError;

      const studentCounts = new Map<string, number>();
      for (const p of profiles ?? []) {
        if (!p.tenant_id) continue;
        studentCounts.set(p.tenant_id, (studentCounts.get(p.tenant_id) ?? 0) + 1);
      }
      const courseCounts = new Map<string, number>();
      for (const c of courses ?? []) {
        courseCounts.set(c.tenant_id, (courseCounts.get(c.tenant_id) ?? 0) + 1);
      }

      return (tenants ?? []).map((t) => ({
        ...t,
        studentCount: studentCounts.get(t.id) ?? 0,
        courseCount: courseCounts.get(t.id) ?? 0,
      })) satisfies TenantWithCounts[];
    },
  });
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tenantId, status }: { tenantId: string; status: TenantStatus }) => {
      const { error } = await supabase.from("tenants").update({ status }).eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform", "tenants"] }),
  });
}
