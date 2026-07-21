import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Layers,
  ChevronRight,
  BadgeCheck,
  Smartphone,
  Infinity as InfinityIcon,
  PlayCircle,
  UserRound,
  Laptop2,
  Radio,
  MessageCircleQuestion,
  RotateCcw,
} from "lucide-react";
import { supabase, TENANT_SLUG } from "@/lib/supabase";
import { CurriculumAccordion } from "./curriculum-accordion";
import { CourseTabs } from "./course-tabs";
import { ShareButton } from "./share-button";

export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

async function getCourse(id: string) {
  if (!supabase) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*)), course_instructors(*)")
    .eq("id", id)
    .eq("status", "published")
    .is("deleted_at", null)
    .is("modules.deleted_at", null)
    .is("modules.lessons.deleted_at", null)
    .is("course_instructors.deleted_at", null)
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
  const previewLessons = modules.flatMap((m) => (m.lessons ?? []).filter((l) => l.is_free_preview));
  const isFree = Number(course.price) === 0;
  const enrollHref = `${APP_URL}/courses/${course.id}?tenant=${TENANT_SLUG}`;

  const stats = [
    course.duration_label ? { icon: Clock, label: course.duration_label } : null,
    { icon: Layers, label: `${modules.length} ${modules.length === 1 ? "module" : "modules"} · ${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}` },
    { icon: InfinityIcon, label: `${course.validity_days} days access` },
  ].filter((s): s is { icon: typeof Clock; label: string } => s !== null);

  const overviewTab = (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-muted/40 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Try before you buy</p>
        <h3 className="mt-1 font-semibold">Course demo</h3>
        {previewLessons.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Watch these lessons free — no enrollment needed — to see the teaching style before you commit.
            </p>
            <ul className="mt-3 space-y-1.5">
              {previewLessons.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <PlayCircle className="size-4 shrink-0 text-brand" /> {l.title}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No free preview lessons yet — check the Content tab for the full curriculum.</p>
        )}
      </div>

      {course.description && (
        <div>
          <h3 className="font-semibold">About this course</h3>
          <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Feature icon={BadgeCheck} title="Live + recorded" description="Attend live classes or catch up anytime with recordings." />
        <Feature icon={Smartphone} title="Any device" description="Learn from your laptop, tablet, or phone." />
        <Feature icon={InfinityIcon} title={`${course.validity_days} days access`} description="Revisit lessons as many times as you need." />
      </div>
    </div>
  );

  const contentTab = (
    <div>
      <p className="text-sm text-muted-foreground">
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
    </div>
  );

  const instructors = (course.course_instructors ?? []).slice().sort((a, b) => a.order_index - b.order_index);

  const instructorsTab =
    instructors.length > 0 ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {instructors.map((instructor) => (
          <div key={instructor.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
            {instructor.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element -- external, per-tenant instructor photo URLs */
              <img src={instructor.photo_url} alt={instructor.name} className="size-12 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">{instructor.name}</p>
              {instructor.title && <p className="text-xs text-brand">{instructor.title}</p>}
              {instructor.bio && <p className="mt-1 text-sm text-muted-foreground">{instructor.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <UserRound className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-medium">Instructor details coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">We'll introduce the faculty teaching this course here.</p>
      </div>
    );

  const howToUseTab = (
    <div className="space-y-3 text-sm text-muted-foreground">
      <HowToItem icon={Laptop2} title="Use a laptop or desktop where you can">
        Live classes and practical software walkthroughs are easiest to follow on a bigger screen — mobile works
        for catching up, but a laptop is best for the live sessions themselves.
      </HowToItem>
      <HowToItem icon={Radio} title="Show up live when you can">
        You'll get the most out of a live class by attending it in real time — that's when you can actually ask
        questions and get an answer on the spot.
      </HowToItem>
      <HowToItem icon={RotateCcw} title="Missed one? The recording's already there">
        Every live class is auto-recorded and added to the course as soon as it ends — check the Content tab.
      </HowToItem>
      <HowToItem icon={MessageCircleQuestion} title="Ask questions">
        Don't sit on a doubt — bring it to the next live session. That's what the live format is for.
      </HowToItem>
    </div>
  );

  const faqTab = (
    <div className="space-y-3">
      <FaqItem question="How long do I have access to this course?">
        {course.validity_days} days from the date you enroll.
      </FaqItem>
      <FaqItem question="Can I preview the course before buying?">
        {previewLessons.length > 0
          ? `Yes — ${previewLessons.length} ${previewLessons.length === 1 ? "lesson is" : "lessons are"} available to watch free before you enroll. See the Overview tab.`
          : "This course doesn't have free preview lessons yet, but you can check the full curriculum under the Content tab before deciding."}
      </FaqItem>
      <FaqItem question="Is this course live or recorded?">
        A mix of both where applicable — live classes for real-time doubt-clearing, and recordings of every live
        session so you can revisit anytime.
      </FaqItem>
      <FaqItem question="What if I have doubts during the course?">
        Live classes are built for real-time Q&A with faculty. Check the Content tab to see which lessons in this
        course are live sessions.
      </FaqItem>
      <FaqItem question="What if I miss a live class?">
        No problem — it's recorded automatically and shows up in the Content tab, usually within a few minutes of
        the session ending.
      </FaqItem>
      <FaqItem question="Do I need any prior experience to join?">
        Check the course description on the Overview tab — most courses here are built to take you from the
        basics, but requirements vary by course.
      </FaqItem>
    </div>
  );

  const reviewsTab = (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">No reviews yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Be the first to enroll and share yours.</p>
    </div>
  );

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
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-semibold">{course.title}</h1>
              <ShareButton title={course.title} />
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {stats.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="size-4" /> {label}
                </span>
              ))}
            </div>
          </div>

          <CourseTabs
            tabs={[
              { id: "overview", label: "Overview", content: overviewTab },
              { id: "content", label: "Content", content: contentTab },
              { id: "instructors", label: "Instructors", content: instructorsTab },
              { id: "how-to-use", label: "How to use", content: howToUseTab },
              { id: "faq", label: "FAQ", content: faqTab },
              { id: "reviews", label: "Reviews", content: reviewsTab },
            ]}
          />
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

function HowToItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Laptop2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-brand" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1">{children}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border p-4">
      <summary className="cursor-pointer list-none font-medium marker:content-none">
        {question}
      </summary>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </details>
  );
}
