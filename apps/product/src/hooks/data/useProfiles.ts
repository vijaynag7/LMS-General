import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Role } from "@edusaas/shared";

export function useProfilesByRole(role: Role) {
  return useQuery({
    queryKey: ["profiles", role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", role)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
