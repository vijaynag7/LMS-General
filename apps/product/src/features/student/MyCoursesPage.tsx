import { Link } from "react-router-dom";
import { useMyEnrollments } from "@/hooks/data/useEnrollment";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MyCoursesPage() {
  const { data: enrollments, isLoading } = useMyEnrollments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="text-muted-foreground">Continue where you left off.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && enrollments?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You haven't enrolled in any courses yet. Browse the{" "}
          <Link to="/" className="underline underline-offset-4">
            catalog
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments?.map((enrollment) => (
          <Link key={enrollment.id} to={`/app/student/courses/${enrollment.course_id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="line-clamp-2">{enrollment.courses?.title}</CardTitle>
                <CardDescription>{Math.round(Number(enrollment.progress_percent))}% complete</CardDescription>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${Math.min(100, Number(enrollment.progress_percent))}%` }}
                  />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
