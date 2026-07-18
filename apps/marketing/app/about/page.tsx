import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">About us</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          We built this platform around a simple frustration: most online courses ask you to pay before you can
          judge whether the teaching is any good. Every course here shows its full module-wise curriculum and a
          free preview lesson upfront, so you know exactly what you're getting before you commit.
        </p>
        <p>
          Classes run live, so you can ask questions and get real answers — not just watch a static recording. Every
          live session is automatically recorded too, so if you miss one or want to go over a topic again, it's
          there whenever you need it, on your phone or laptop.
        </p>
        <p>
          One clear price per course, one clear access period, and no hidden tiers — just the material, live
          support, and enough time to actually learn it.
        </p>
      </div>
    </div>
  );
}
