import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Layers, ChevronRight, BadgeCheck, Smartphone, Infinity as InfinityIcon } from "lucide-react";
import { supabase, TENANT_SLUG } from "@/lib/supabase";
import { CurriculumAccordion } from "./curriculum-accordion";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

async function getCourse(id: string) {
  if (!supabase) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("id", id)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  return course;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const modules = (course.modules ?? []).slice().sort((a, b) => a.order_index - b.order_index);
  const lessonCount = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  const previewCount = modules.reduce(
    (sum, m) => sum + (m.lessons?.filter((l) => l.is_free_preview).length ?? 0),
    0,
  );
  const isFree = Number(course.price) === 0;
  const enrollHref = `${APP_URL}/courses/${course.id}?tenant=${TENANT_SLUG}`;

  const stats = [
    course.duration_label ? { icon: Clock, label: course.duration_label } : null,
    { icon: Layers, label: `${modules.length} ${modules.length === 1 ? "module" : "modules"} · ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}` },
    { icon: InfinityIcon, label: `${course.validity_days} days access` },
  ].filter((s): s is { icon: typeof Clock; label: string } => s !== null);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-6 pt-8 text-sm text-muted-foreground">
        <Link href="/courses" className="hover:text-foreground">
          Courses
        </Link>
        <ChevronRight className="mx-1 inline size-3.5" />
        <span>{course.title}</span>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-semibold">{course.title}</h1>
            {course.description && <p className="mt-3 text-muted-foreground">{course.description}</p>}

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {stats.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="size-4" /> {label}
                </span>
              ))}
            </div>

            {previewCount > 0 && (
              <p className="mt-4 text-sm text-brand">
                {previewCount} free preview {previewCount === 1 ? "lesson" : "lessons"} available before you enroll.
              </p>
            )}
          </div>

          <section id="curriculum">
            <h2 className="text-xl font-semibold">Course curriculum</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {modules.length} {modules.length === 1 ? "module" : "modules"}, {lessonCount}{" "}
              {lessonCount === 1 ? "lesson" : "lessons"} total.
            </p>
            {modules.length > 0 ? (
              <div className="mt-4">
                <CurriculumAccordion modules={modules} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Curriculum coming soon.</p>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Feature icon={BadgeCheck} title="Live + recorded" description="Attend live classes or catch up anytime with recordings." />
            <Feature icon={Smartphone} title="Any device" description="Learn from your laptop, tablet, or phone." />
            <Feature icon={InfinityIcon} title={`${course.validity_days} days access`} description="Revisit lessons as many times as you need." />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-border p-6">
            <p className="text-3xl font-semibold">
              {isFree ? "Free" : `${course.currency} ${course.price}`}
            </p>
            {course.duration_label && (
              <p className="mt-1 text-sm text-muted-foreground">{course.duration_label} · {course.validity_days} days access</p>
            )}
            <a
              href={enrollHref}
              className="mt-5 block rounded-md bg-brand px-5 py-3 text-center text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              {isFree ? "Enroll for free" : "Enroll now"}
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">Instant access after enrollment</p>
          </div>
        </div>
      </div>

      {/* Mobile sticky enroll bar */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-6 py-3 lg:hidden">
        <span className="font-semibold">{isFree ? "Free" : `${course.currency} ${course.price}`}</span>
        <a
          href={enrollHref}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90"
        >
          {isFree ? "Enroll for free" : "Enroll now"}
        </a>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: typeof BadgeCheck; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <Icon className="size-5 text-brand" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
