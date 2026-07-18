import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { email: string; name: string; role: "faculty" | "student"; phone?: string }) => {
      const { data, error } = await supabase.functions.invoke("invite-user", { body: params });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
