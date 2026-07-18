import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Layers } from "lucide-react";
import { supabase, TENANT_SLUG } from "@/lib/supabase";

export const metadata: Metadata = { title: "Courses" };
export const revalidate = 60;

async function getCourses() {
  if (!supabase) return [];

  const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", TENANT_SLUG).single();
  if (!tenant) return [];

  const { data: courses } = await supabase
    .from("courses")
    .select("*, modules(id, lessons(id))")
    .eq("tenant_id", tenant.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return courses ?? [];
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Courses</h1>
        <p className="mt-2 text-muted-foreground">Browse what's currently open for enrollment.</p>
      </div>

      {courses.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">No published courses yet — check back soon.</p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {courses.map((course) => {
          const moduleCount = course.modules?.length ?? 0;
          const lessonCount = course.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0;
          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block rounded-xl border border-border p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-semibold">{course.title}</h2>
              {course.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {course.duration_label && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {course.duration_label}
                  </span>
                )}
                {moduleCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="size-3.5" />
                    {moduleCount} {moduleCount === 1 ? "module" : "modules"} · {lessonCount}{" "}
                    {lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-brand">
                  {course.price === 0 ? "Free" : `${course.currency} ${course.price}`}
                </span>
                <span className="text-sm font-medium text-brand">View course →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
