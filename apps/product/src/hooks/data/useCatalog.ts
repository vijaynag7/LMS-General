import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/hooks/useTenant";
import type { Database } from "@edusaas/shared";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type CourseWithCurriculum = CourseRow & {
  modules: (ModuleRow & { lessons: LessonRow[] })[];
};

export function useCatalog() {
  const { tenant } = useTenant();
  return useQuery({
    queryKey: ["catalog", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
}

export function useCourseCatalogDetail(courseId: string | undefined) {
  return useQuery({
    queryKey: ["catalog", "detail", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, modules(*, lessons(*))")
        .eq("id", courseId!)
        .single();
      if (error) throw error;
      return data as unknown as CourseWithCurriculum;
    },
    enabled: !!courseId,
  });
}
