import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@edusaas/shared";

type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"];
export type EnrollmentWithCourse = EnrollmentRow & {
  courses: { title: string; thumbnail_url: string | null; currency: string; price: number } | null;
};

export function useMyEnrollments() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["enrollments", "mine", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(title, thumbnail_url, currency, price)")
        .eq("student_id", profile!.id)
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data as unknown as EnrollmentWithCourse[];
    },
    enabled: !!profile?.id,
  });
}

export function useMyEnrollmentFor(courseId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["enrollments", "mine", profile?.id, courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", profile!.id)
        .eq("course_id", courseId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && !!courseId,
  });
}

export function useEnrollFree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase.functions.invoke("enroll-free", { body: { courseId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
  });
}

export function usePlaybackUrl() {
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { data, error } = await supabase.functions.invoke<{ url: string | null }>("get-playback-url", {
        body: { lessonId },
      });
      if (error) throw error;
      return data?.url ?? null;
    },
  });
}
