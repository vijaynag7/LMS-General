import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@edusaas/shared";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuizWithQuestions = QuizRow & { questions: QuestionRow[] };

export function useQuizForLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["quiz", "lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .eq("lesson_id", lessonId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as QuizWithQuestions | null;
    },
    enabled: !!lessonId,
  });
}

export function useMyQuizAttempt(quizId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["quiz_attempts", "mine", quizId, profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId!)
        .eq("student_id", profile!.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!quizId && !!profile?.id,
  });
}

export function useSubmitQuizAttempt(quizId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ answers, score }: { answers: Record<string, number>; score: number }) => {
      if (!profile) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          tenant_id: profile.tenant_id!,
          quiz_id: quizId,
          student_id: profile.id,
          answers,
          score,
          submitted_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quiz_attempts"] }),
  });
}

export function useAssignmentForLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["assignment", "lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("assignments").select("*").eq("lesson_id", lessonId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });
}

export function useMySubmission(assignmentId: string | undefined) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["assignment_submissions", "mine", assignmentId, profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", assignmentId!)
        .eq("student_id", profile!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!assignmentId && !!profile?.id,
  });
}

export function useSubmitAssignment(assignmentId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileUrl: string) => {
      if (!profile) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("assignment_submissions")
        .upsert(
          {
            tenant_id: profile.tenant_id!,
            assignment_id: assignmentId,
            student_id: profile.id,
            file_url: fileUrl,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: "assignment_id,student_id" },
        )
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignment_submissions"] }),
  });
}
