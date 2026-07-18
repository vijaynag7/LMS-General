import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">About EduSaaS</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          Coaching institutes and tutors typically stitch together Zoom, WhatsApp, a payment link, and an unlisted
          YouTube playlist to run their business online. It works, but it means no single dashboard for content,
          payments, or student tracking — and rising per-minute video costs as they scale.
        </p>
        <p>
          EduSaaS is a multi-tenant learning platform built for that gap: each institute gets its own branded space
          — courses, live classes, payments, and students — running on a video stack we own and operate, so there's
          no third-party meeting tool and no per-minute billing surprises.
        </p>
        <p>
          We're built for the same institutes and tutors that platforms like Graphy and Classplus serve, with one
          difference under the hood: live classes run on our own self-hosted WebRTC infrastructure end to end.
        </p>
      </div>
    </div>
  );
}
