import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { CourseInput } from "@edusaas/shared";

export function useCourses() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["courses", profile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id,
  });
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["courses", "detail", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("id", courseId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("courses")
        .insert({
          tenant_id: profile.tenant_id,
          title: input.title,
          description: input.description,
          price: input.price,
          currency: input.currency,
          validity_days: input.validityDays,
          status: input.status,
          created_by: profile.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CourseInput>) => {
      const { data, error } = await supabase
        .from("courses")
        .update({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.price !== undefined && { price: input.price }),
          ...(input.currency !== undefined && { currency: input.currency }),
          ...(input.validityDays !== undefined && { validity_days: input.validityDays }),
          ...(input.status !== undefined && { status: input.status }),
        })
        .eq("id", courseId)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase.from("courses").update({ deleted_at: new Date().toISOString() }).eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });
}
