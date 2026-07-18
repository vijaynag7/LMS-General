import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, courseInterest, message } = parsed.data;
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!resendApiKey || !toEmail) {
    // Non-fatal in local/dev — the form still round-trips successfully so it
    // can be exercised without secrets configured.
    console.warn("RESEND_API_KEY / CONTACT_TO_EMAIL not set — contact email not sent", { name, email });
    return NextResponse.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "contact@edusaas.app",
      to: toEmail,
      reply_to: email,
      subject: `New contact form submission from ${name}`,
      html: `<p><strong>${name}</strong> (${email})${courseInterest ? ` — interested in: ${courseInterest}` : ""}</p><p>${message}</p>`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Could not send your message right now" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
