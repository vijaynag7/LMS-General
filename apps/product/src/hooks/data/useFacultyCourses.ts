import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@edusaas/shared";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

export function useFacultyCourses() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["faculty_courses", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("course_faculty").select("courses(*)").eq("faculty_id", profile!.id);
      if (error) throw error;
      return (data as unknown as { courses: CourseRow }[]).map((row) => row.courses);
    },
    enabled: !!profile?.id,
  });
}

export function useUpcomingLiveSessions() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["live_sessions", "upcoming", profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*, lessons(title, module_id, modules(course_id, courses(title)))")
        .neq("status", "ended")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Array<{
        id: string;
        lesson_id: string;
        scheduled_at: string;
        status: string;
        lessons: { title: string; modules: { course_id: string; courses: { title: string } } };
      }>;
    },
    enabled: !!profile?.tenant_id,
  });
}
