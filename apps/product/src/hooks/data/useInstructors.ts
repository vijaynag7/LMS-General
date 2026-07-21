import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useInstructors(courseId: string | undefined) {
  return useQuery({
    queryKey: ["instructors", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_instructors")
        .select("*")
        .eq("course_id", courseId!)
        .is("deleted_at", null)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useCreateInstructor(courseId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; title?: string; bio?: string; photoUrl?: string; order: number }) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase.from("course_instructors").insert({
        tenant_id: profile.tenant_id,
        course_id: courseId,
        name: input.name,
        title: input.title || null,
        bio: input.bio || null,
        photo_url: input.photoUrl || null,
        order_index: input.order,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructors", courseId] }),
  });
}

export function useUpdateInstructor(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string; title?: string; bio?: string; photoUrl?: string }) => {
      const { error } = await supabase
        .from("course_instructors")
        .update({
          name: input.name,
          title: input.title || null,
          bio: input.bio || null,
          photo_url: input.photoUrl || null,
        })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructors", courseId] }),
  });
}

export function useDeleteInstructor(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("course_instructors")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructors", courseId] }),
  });
}
