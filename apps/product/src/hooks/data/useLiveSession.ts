import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useLiveSessionForLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ["live_session", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("live_sessions").select("*").eq("lesson_id", lessonId!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
    refetchInterval: 15_000,
  });
}

export function useUpdateLiveSessionSchedule(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheduledAt: string) => {
      const { error } = await supabase.from("live_sessions").update({ scheduled_at: scheduledAt }).eq("lesson_id", lessonId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live_session", lessonId] }),
  });
}

export function useJoinLiveRoom() {
  return useMutation({
    mutationFn: async (liveSessionId: string) => {
      const { data, error } = await supabase.functions.invoke<{ token: string; url: string; roomName: string }>(
        "live-room",
        { body: { liveSessionId } },
      );
      if (error) throw error;
      if (!data) throw new Error("No response from live-room function");
      return data;
    },
  });
}

export function useRecordAttendanceJoin() {
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (liveSessionId: string) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("attendance")
        .insert({ tenant_id: profile.tenant_id, live_session_id: liveSessionId, student_id: profile.id })
        .select("id")
        .single();
      if (error) throw error;
      return { attendanceId: data.id, joinedAt: new Date().toISOString() };
    },
  });
}

export function useRecordAttendanceLeave() {
  return useMutation({
    mutationFn: async ({ attendanceId, joinedAt }: { attendanceId: string; joinedAt: string }) => {
      const durationSeconds = Math.round((Date.now() - new Date(joinedAt).getTime()) / 1000);
      const { error } = await supabase
        .from("attendance")
        .update({ left_at: new Date().toISOString(), duration_seconds: durationSeconds })
        .eq("id", attendanceId);
      if (error) throw error;
    },
  });
}
