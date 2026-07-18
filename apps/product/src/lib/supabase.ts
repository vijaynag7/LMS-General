import { createClient } from "@supabase/supabase-js";
import type { Database } from "@edusaas/shared";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  // Non-fatal: lets the UI shell render (and be visually reviewed) before a
  // real Supabase project is wired up. Copy .env.example to .env.local to fix.
  console.warn(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy apps/product/.env.example to .env.local and fill in your Supabase project values. Data-dependent pages will not work until then.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
