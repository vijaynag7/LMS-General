import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/hooks/useTenant";
import type { Database } from "@edusaas/shared";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (params: { email: string; password: string; name: string; role: Profile["role"] }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    });
    return () => listener.subscription.unsubscribe();
  }, [queryClient]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      if (!session) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const signInWithPassword = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithPassword = React.useCallback(
    async ({ email, password, name, role }: { email: string; password: string; name: string; role: Profile["role"] }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, tenant_id: tenant?.id ?? null },
        },
      });
      if (error) throw error;
    },
    [tenant?.id],
  );

  const signInWithGoogle = React.useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    session,
    profile: profile ?? null,
    isLoading: sessionLoading || (!!session && profileLoading),
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
