import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useUpcomingClassesForStudent() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["student_upcoming_classes", profile?.id],
    queryFn: async () => {
      const { data: enrollments } = await supabase.from("enrollments").select("course_id").eq("student_id", profile!.id);
      const courseIds = (enrollments ?? []).map((e) => e.course_id);
      if (courseIds.length === 0) return [];

      const { data, error } = await supabase
        .from("live_sessions")
        .select("*, lessons(title, modules(course_id, courses(title)))")
        .neq("status", "ended")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;

      type Row = {
        scheduled_at: string;
        lessons: { title: string; modules: { course_id: string; courses: { title: string } } } | null;
      };
      return (data as unknown as Row[]).filter((row) => courseIds.includes(row.lessons?.modules?.course_id ?? ""));
    },
    enabled: !!profile?.id,
  });
}

export function useMyQuizScores() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["student_quiz_scores", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title)")
        .eq("student_id", profile!.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as unknown as Array<{ id: string; score: number | null; quizzes: { title: string } | null }>;
    },
    enabled: !!profile?.id,
  });
}
