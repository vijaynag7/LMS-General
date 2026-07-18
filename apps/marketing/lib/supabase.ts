import { createClient } from "@supabase/supabase-js";
import type { Database } from "@edusaas/shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Server-side only, read-only public data (published courses) — the anon key
// is safe here since RLS already scopes it to what's meant to be public.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null;

// This marketing site is currently run for a single institute rather than as
// a directory across tenants — which tenant's courses to show is set here.
export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "demo";
