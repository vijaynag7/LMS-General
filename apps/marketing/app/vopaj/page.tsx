import type { Metadata } from "next";
import Link from "next/link";
import { Video, Briefcase, Users, LineChart } from "lucide-react";
import { VOPAJ_TRACKS } from "@/lib/vopaj-programs";

export const metadata: Metadata = {
  title: "Vopaj — Training for Finance Professionals",
  description:
    "Practical training, mock interviews, and career mentorship for CA, CMA, CS and finance professionals — from the team behind EduSaaS.",
};

const DIFFERENTIATORS = [
  {
    icon: Video,
    title: "Mock interviews, evaluated properly",
    description:
      "Practice with mentors who rate you on technical knowledge, communication, confidence, and presentation — with a downloadable report and clear next steps.",
  },
  {
    icon: Briefcase,
    title: "Connected to the Vopaj job portal",
    description:
      "Your course completions, certificates, and assessment scores feed straight into your Vopaj profile — recruiters see a candidate who's actually placement-ready.",
  },
  {
    icon: Users,
    title: "Career mentorship, not just content",
    description: "One-on-one sessions with finance mentors for the questions a video lesson can't answer.",
  },
  {
    icon: LineChart,
    title: "Practical, not just theoretical",
    description: "Real Excel workings, GST filings, and financial statements — the work you'll actually be doing.",
  },
];

export default function VopajPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-sm font-medium text-brand">Vopaj — a EduSaaS training track</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Career-ready training for finance professionals
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          From articleship to interview to placement — practical courses, mock interviews, and mentorship for CA,
          CMA, CS, and finance professionals, built by the team behind Vopaj's job portal.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/vopaj/programs"
            className="rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Explore Vopaj programs
          </Link>
          <Link
            href="/vopaj/mock-interviews"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Mock interview programme
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon className="size-6 text-brand" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Programs by track</h2>
          <p className="mt-2 text-muted-foreground">Four tracks, from your first articleship to your next placement.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VOPAJ_TRACKS.map((track) => (
            <div key={track.slug} className="rounded-xl border border-border p-6">
              <h3 className="font-semibold">{track.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{track.description}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {track.programs.slice(0, 3).map((p) => (
                  <li key={p}>· {p}</li>
                ))}
                {track.programs.length > 3 && <li>+ {track.programs.length - 3} more</li>}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/vopaj/programs" className="text-sm font-medium text-brand hover:underline">
            View all Vopaj programs →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold">Ready to get placement-ready?</h2>
        <p className="mt-2 text-muted-foreground">
          Explore our programs or get in touch to talk through the right track for where you are.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}
