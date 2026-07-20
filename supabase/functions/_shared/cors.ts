// Edge Functions run on a different origin than the app (*.supabase.co vs.
// localhost/*.vercel.app), so every function callable from the browser needs
// these headers or the browser blocks the request before it even reaches
// here — no server-side error, just a CORS failure in devtools. Server-only
// functions (webhooks from Razorpay/LiveKit, cron-triggered jobs) don't need
// this since browsers aren't the caller.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
