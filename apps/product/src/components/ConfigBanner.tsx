import { isSupabaseConfigured } from "@/lib/supabase";

export function ConfigBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
      Supabase isn't configured yet — copy <code>apps/product/.env.example</code> to <code>.env.local</code> and
      fill in your project URL/anon key. Showing the UI shell only.
    </div>
  );
}
