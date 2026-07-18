import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useCourses } from "@/hooks/data/useCourses";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CoursesListPage() {
  const { data: courses, isLoading } = useCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-muted-foreground">Build and manage your curriculum.</p>
        </div>
        <Link to="new" className={buttonVariants({ variant: "brand", className: "flex items-center gap-2" })}>
          <Plus className="size-4" /> New course
        </Link>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && courses?.length === 0 && (
        <p className="text-sm text-muted-foreground">No courses yet — create your first one.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Link key={course.id} to={course.id}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <Badge variant={course.status === "published" ? "success" : "secondary"}>{course.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{course.description || "No description yet."}</CardDescription>
                <p className="pt-2 text-sm font-medium">
                  {course.currency} {course.price}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
