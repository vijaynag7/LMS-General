import type { Metadata } from "next";
import Link from "next/link";
import { VOPAJ_TRACKS } from "@/lib/vopaj-programs";

export const metadata: Metadata = {
  title: "Vopaj Programs",
  description: "Practical training programs for CA, CMA, CS and finance professionals, organized by career stage.",
};

export default function VopajProgramsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">Vopaj</p>
        <h1 className="mt-2 text-3xl font-semibold">Programs</h1>
        <p className="mt-2 text-muted-foreground">
          Organized by where you are in your career — from your first articleship to your next placement.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {VOPAJ_TRACKS.map((track) => (
          <div key={track.slug} id={track.slug} className="rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold">{track.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{track.description}</p>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {track.programs.map((p) => (
                <li key={p} className="rounded-md bg-muted/50 px-4 py-2.5 text-sm">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-muted/40 p-6 text-center">
        <p className="font-medium">Not sure which track fits where you are?</p>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about your background and goals — we'll point you to the right one.</p>
        <Link href="/contact" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
          Get in touch →
        </Link>
      </div>
    </div>
  );
}
