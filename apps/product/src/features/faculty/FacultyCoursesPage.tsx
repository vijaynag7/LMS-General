import { Link } from "react-router-dom";
import { useFacultyCourses } from "@/hooks/data/useFacultyCourses";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FacultyCoursesPage() {
  const { data: courses, isLoading } = useFacultyCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="text-muted-foreground">Courses you're assigned to teach.</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && courses?.length === 0 && (
        <p className="text-sm text-muted-foreground">No courses assigned yet — ask your institute admin.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Link key={course.id} to={`/app/faculty/courses/${course.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <Badge variant={course.status === "published" ? "success" : "secondary"}>{course.status}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
