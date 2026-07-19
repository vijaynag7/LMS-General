import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Brain, Smile, Presentation, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Vopaj Mock Interviews",
  description: "Practice interviews with finance mentors, rated on technical knowledge, communication, confidence, and presentation.",
};

const CRITERIA = [
  { icon: Brain, label: "Technical knowledge" },
  { icon: MessageSquare, label: "Communication" },
  { icon: Smile, label: "Confidence" },
  { icon: Presentation, label: "Presentation" },
];

export default function VopajMockInterviewsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">Vopaj</p>
        <h1 className="mt-2 text-3xl font-semibold">Mock Interview Programme</h1>
        <p className="mt-3 text-muted-foreground">
          A real interview, with a mentor on the other side — not a checklist. You get honest, structured feedback
          you can actually act on before the interview that counts.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-4">
        {CRITERIA.map(({ icon: Icon, label }) => (
          <div key={label} className="rounded-lg border border-border p-4 text-center">
            <Icon className="mx-auto size-6 text-brand" />
            <p className="mt-2 text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <div>
          <h2 className="font-semibold">How it works</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>1. Tell us your target role and experience level.</li>
            <li>2. We match you with a mentor and a role-relevant question set.</li>
            <li>3. Sit a real mock interview over video, with your resume in front of the mentor.</li>
            <li>4. Get rated on technical knowledge, communication, confidence, and presentation.</li>
            <li>5. Receive a written report with strengths, areas to improve, and an overall recommendation.</li>
          </ol>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <FileCheck className="mt-0.5 size-5 shrink-0 text-brand" />
          <p className="text-sm text-muted-foreground">
            You'll come away with a downloadable interview report, and the option to book a re-interview once
            you've worked on the feedback.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6 text-center">
        <p className="font-medium">Online slot booking is coming soon.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          For now, get in touch and we'll set up your mock interview directly.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          Book a mock interview
        </Link>
      </div>
    </div>
  );
}
