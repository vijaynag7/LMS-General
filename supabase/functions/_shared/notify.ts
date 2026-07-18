// Shared by any Edge Function that needs to send a transactional email +
// log a notifications row. Not a standalone deployable function — imported
// via relative path from functions that need it (enroll-free, verify-payment,
// razorpay-webhook, class-reminders).

import { createClient } from "jsr:@supabase/supabase-js@2";

type NotificationType = "welcome" | "enrollment_confirmation" | "class_reminder" | "payment_receipt";

const SUBJECTS: Record<NotificationType, string> = {
  welcome: "Welcome to {{tenantName}}",
  enrollment_confirmation: "You're enrolled in {{courseName}}",
  class_reminder: "Your class starts soon: {{lessonName}}",
  payment_receipt: "Payment receipt — {{courseName}}",
};

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

function bodyHtml(type: NotificationType, vars: Record<string, string>): string {
  switch (type) {
    case "welcome":
      return `<p>Hi ${vars.name ?? ""},</p><p>Welcome to <strong>${vars.tenantName ?? "your institute"}</strong>! You're all set to start learning.</p>`;
    case "enrollment_confirmation":
      return `<p>Hi ${vars.name ?? ""},</p><p>You're enrolled in <strong>${vars.courseName ?? ""}</strong>. Jump back in any time from your dashboard.</p>`;
    case "class_reminder":
      return `<p>Hi ${vars.name ?? ""},</p><p>Your live class "<strong>${vars.lessonName ?? ""}</strong>" starts at ${vars.scheduledAt ?? ""}.</p>`;
    case "payment_receipt":
      return `<p>Hi ${vars.name ?? ""},</p><p>We received your payment of ${vars.amount ?? ""} for <strong>${vars.courseName ?? ""}</strong>. Invoice: ${vars.invoiceNumber ?? ""}.</p>`;
  }
}

export async function sendNotification(params: {
  supabaseUrl: string;
  serviceRoleKey: string;
  userId: string;
  tenantId: string | null;
  type: NotificationType;
  vars: Record<string, string>;
}) {
  const { supabaseUrl, serviceRoleKey, userId, tenantId, type, vars } = params;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email;

  const subject = renderTemplate(SUBJECTS[type], vars);
  const html = bodyHtml(type, vars);

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  let status: "sent" | "failed" | "pending" = "pending";

  if (resendApiKey && email) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM_EMAIL") ?? "notifications@edusaas.app",
        to: email,
        subject,
        html,
      }),
    });
    status = res.ok ? "sent" : "failed";
  }

  await admin.from("notifications").insert({
    tenant_id: tenantId,
    user_id: userId,
    type,
    channel: "email",
    status,
    payload: vars,
    sent_at: status === "sent" ? new Date().toISOString() : null,
  });
}
