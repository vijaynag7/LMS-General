import type { Metadata } from "next";
import { Clock, IndianRupee, PlayCircle, Lock } from "lucide-react";
import { supabase, TENANT_SLUG } from "@/lib/supabase";

export const metadata: Metadata = { title: "Courses" };
export const revalidate = 60;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:5173";

async function getCourses() {
  if (!supabase) return [];

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", TENANT_SLUG).single();
  if (!tenant) return [];

  const { data: courses } = await supabase
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return courses ?? [];
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Courses</h1>
        <p className="mt-2 text-muted-foreground">Browse what's currently open for enrollment.</p>
      </div>

      {courses.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">No published courses yet — check back soon.</p>
      )}

      <div className="mt-12 space-y-8">
        {courses.map((course) => {
          const modules = (course.modules ?? []).slice().sort((a, b) => a.order_index - b.order_index);
          return (
            <div key={course.id} className="overflow-hidden rounded-xl border border-border">
              <div className="border-b border-border bg-muted/40 p-6">
                <h2 className="text-xl font-semibold">{course.title}</h2>
                {course.description && <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  {course.duration_label && (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-4" /> {course.duration_label}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 font-medium text-brand">
                    {course.price === 0 ? (
                      "Free"
                    ) : (
                      <>
                        {course.currency === "INR" ? <IndianRupee className="size-4" /> : null}
                        {course.currency === "INR" ? course.price : `${course.currency} ${course.price}`}
                      </>
                    )}
                  </span>
                </div>
                <a
                  href={`${APP_URL}/courses/${course.id}?tenant=${TENANT_SLUG}`}
                  className="mt-5 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90"
                >
                  {course.price === 0 ? "Enroll for free" : "Enroll now"}
                </a>
              </div>

              {modules.length > 0 && (
                <div className="divide-y divide-border">
                  {modules.map((module) => {
                    const lessons = (module.lessons ?? []).slice().sort((a, b) => a.order_index - b.order_index);
                    return (
                      <div key={module.id} className="p-6">
                        <h3 className="font-medium">{module.title}</h3>
                        <ul className="mt-3 space-y-2">
                          {lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                              {lesson.is_free_preview ? (
                                <PlayCircle className="size-4 shrink-0" />
                              ) : (
                                <Lock className="size-4 shrink-0" />
                              )}
                              <span>{lesson.title}</span>
                              {lesson.is_free_preview && (
                                <span className="text-xs font-medium text-brand">Free preview</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
