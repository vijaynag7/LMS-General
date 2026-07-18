import Link from "next/link";
import { Video, ShieldCheck, IndianRupee, BarChart3 } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

const FEATURES = [
  {
    icon: Video,
    title: "Live classes, no third-party tool",
    description: "Self-hosted video — no Zoom or Meet links, no per-minute fees. Screen share, whiteboard, chat, and polls built in.",
  },
  {
    icon: ShieldCheck,
    title: "Content that stays yours",
    description: "Dynamic watermarking, signed playback links, and session limits keep your recordings from being passed around.",
  },
  {
    icon: IndianRupee,
    title: "Get paid, automatically",
    description: "Razorpay checkout with GST-compliant invoicing on every sale — enrollment activates the moment payment clears.",
  },
  {
    icon: BarChart3,
    title: "See what's working",
    description: "Attendance, revenue, and course-level analytics from day one — no spreadsheets required.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Run your coaching institute online — on your own video stack
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          EduSaaS gives your institute a branded platform for live classes, recorded lessons, payments, and student
          tracking — without routing your classes through Zoom or paying per-minute video fees.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a
            href={`${APP_URL}/onboard`}
            className="rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Start your institute — free
          </a>
          <Link
            href="/pricing"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <Icon className="size-6 text-brand" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold">Ready to go live?</h2>
        <p className="mt-2 text-muted-foreground">
          Create your branded space, add your first course, and start teaching — in under 30 minutes.
        </p>
        <a
          href={`${APP_URL}/onboard`}
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          Get started
        </a>
      </section>
    </div>
  );
}
