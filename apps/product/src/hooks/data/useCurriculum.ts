import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Database, LessonType } from "@edusaas/shared";

type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
export type ModuleWithLessons = ModuleRow & { lessons: LessonRow[] };

export function useModules(courseId: string | undefined) {
  return useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", courseId!)
        .is("deleted_at", null)
        .is("lessons.deleted_at", null)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as unknown as ModuleWithLessons[];
    },
    enabled: !!courseId,
  });
}

export function useCreateModule(courseId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, order }: { title: string; order: number }) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("modules")
        .insert({ course_id: courseId, tenant_id: profile.tenant_id, title, order_index: order })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

export function useReorderModules(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ordered: { id: string; order_index: number }[]) => {
      await Promise.all(
        ordered.map(({ id, order_index }) => supabase.from("modules").update({ order_index }).eq("id", id)),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      const { error } = await supabase.from("modules").update({ deleted_at: new Date().toISOString() }).eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

export function useCreateLesson(courseId: string, moduleId: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, type, order }: { title: string; type: LessonType; order: number }) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("lessons")
        .insert({ module_id: moduleId, tenant_id: profile.tenant_id, title, type, order_index: order })
        .select("*")
        .single();
      if (error) throw error;

      // A live lesson always has exactly one live_sessions row to schedule
      // against — created here so the admin only has to set a date, not
      // separately create the session.
      if (type === "live") {
        await supabase.from("live_sessions").insert({
          lesson_id: data.id,
          tenant_id: profile.tenant_id,
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; is_free_preview?: boolean; title?: string; drip_release_at?: string | null }) => {
      const { error } = await supabase.from("lessons").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase.from("lessons").update({ deleted_at: new Date().toISOString() }).eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}

// Gets a signed upload URL from sign-lesson-upload (server-side filename
// sanitizing + auth check), PUTs the file straight to Storage with it — so
// large video files never pass through an Edge Function body — then points
// the lesson's content_ref at the resulting path. Playback goes through the
// get-playback-url Edge Function, which mints a signed URL after checking
// access — see that function's own comment for why this isn't a public URL.
export function useUploadLessonContent(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, file }: { lessonId: string; file: File }) => {
      const { data, error } = await supabase.functions.invoke<{ path: string; token: string }>(
        "sign-lesson-upload",
        { body: { lessonId, fileName: file.name } },
      );
      if (error) throw error;
      if (!data) throw new Error("Could not get an upload URL");

      const { error: uploadError } = await supabase.storage
        .from("lesson-content")
        .uploadToSignedUrl(data.path, data.token, file);
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("lessons")
        .update({ content_ref: { path: data.path } })
        .eq("id", lessonId);
      if (updateError) throw updateError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["modules", courseId] }),
  });
}
