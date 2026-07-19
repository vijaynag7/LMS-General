import Link from "next/link";
import { Radio, PlayCircle, ListChecks, IndianRupee, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Radio,
    title: "Live doubt-clearing classes",
    description: "Join live sessions with faculty and get your questions answered in real time — not just a static video.",
  },
  {
    icon: PlayCircle,
    title: "Watch anytime, anywhere",
    description: "Every live class is recorded automatically. Missed it, or want to revisit a topic? Watch it again on any device.",
  },
  {
    icon: ListChecks,
    title: "See the full syllabus first",
    description: "Every course shows its complete module-wise curriculum upfront, with free preview lessons — know what you're getting before you pay.",
  },
  {
    icon: IndianRupee,
    title: "One price, no surprises",
    description: "A single, clear price and access period per course. No hidden tiers, no fine print.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Learn from expert faculty — live and recorded, on your schedule
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Structured courses with live doubt-clearing classes and recorded lessons you can revisit anytime — on
          your phone, tablet, or laptop. Preview the curriculum and a free lesson before you commit.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/courses"
            className="rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Browse courses
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

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <p className="text-sm font-medium text-brand">Also from us</p>
            <h2 className="mt-1 text-xl font-semibold">Vopaj — career training for finance professionals</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mock interviews, mentorship, and practical courses for CA, CMA, CS, and finance professionals —
              connected to the Vopaj job portal.
            </p>
          </div>
          <Link
            href="/vopaj"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Explore Vopaj <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold">Ready to start learning?</h2>
        <p className="mt-2 text-muted-foreground">
          Browse our courses, check out the curriculum, and watch a free preview lesson before you enroll.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          Browse courses
        </Link>
      </section>
    </div>
  );
}
