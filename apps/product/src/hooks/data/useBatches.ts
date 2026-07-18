import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@edusaas/shared";

type BatchRow = Database["public"]["Tables"]["batches"]["Row"];
type BatchStudentRow = Database["public"]["Tables"]["batch_students"]["Row"];
export type BatchWithCourse = BatchRow & { courses: { title: string } | null };
export type BatchStudentWithProfile = BatchStudentRow & { profiles: { name: string; id: string } | null };

export function useBatches(courseId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["batches", profile?.tenant_id, courseId],
    queryFn: async () => {
      let query = supabase.from("batches").select("*, courses(title)").is("deleted_at", null);
      if (courseId) query = query.eq("course_id", courseId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BatchWithCourse[];
    },
    enabled: !!profile?.tenant_id,
  });
}

export function useCreateBatch() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, name }: { courseId: string; name: string }) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("batches")
        .insert({ tenant_id: profile.tenant_id, course_id: courseId, name })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["batches"] }),
  });
}

export function useBatchStudents(batchId: string | undefined) {
  return useQuery({
    queryKey: ["batch_students", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batch_students")
        .select("*, profiles(name, id)")
        .eq("batch_id", batchId!);
      if (error) throw error;
      return data as unknown as BatchStudentWithProfile[];
    },
    enabled: !!batchId,
  });
}

export function useAddStudentToBatch(batchId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase
        .from("batch_students")
        .insert({ batch_id: batchId, student_id: studentId, tenant_id: profile.tenant_id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["batch_students", batchId] }),
  });
}
