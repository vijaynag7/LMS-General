import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, PlayCircle } from "lucide-react";
import { useCourseCatalogDetail } from "@/hooks/data/useCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useMyEnrollmentFor, useEnrollFree } from "@/hooks/data/useEnrollment";
import { Button } from "@/components/ui/button";
import CheckoutButton from "@/features/public/CheckoutButton";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { data: course, isLoading } = useCourseCatalogDetail(courseId);
  const { session } = useAuth();
  const { data: enrollment } = useMyEnrollmentFor(courseId);
  const enrollFree = useEnrollFree();
  const navigate = useNavigate();

  if (isLoading) return <p className="px-6 py-16 text-center text-muted-foreground">Loading…</p>;
  if (!course) return <p className="px-6 py-16 text-center text-muted-foreground">Course not found.</p>;

  const isFree = Number(course.price) === 0;
  const modules = course.modules ?? [];

  const handleFreeEnroll = async () => {
    try {
      await enrollFree.mutateAsync(course.id);
      toast.success("You're enrolled!");
      navigate(`/app/student/courses/${course.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not enroll");
    }
  };

  const requireLogin = () => navigate("/signup", { state: { from: { pathname: `/courses/${courseId}` } } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">{course.title}</h1>
      <p className="mt-2 text-muted-foreground">{course.description}</p>

      {course.duration_label && (
        <p className="mt-2 text-sm text-muted-foreground">Duration: {course.duration_label}</p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xl font-semibold">{isFree ? "Free" : `${course.currency} ${course.price}`}</span>
        {enrollment ? (
          <Button variant="brand" onClick={() => navigate(`/app/student/courses/${course.id}`)}>
            Go to course
          </Button>
        ) : !session ? (
          <Button variant="brand" onClick={requireLogin}>
            {isFree ? "Enroll for free" : "Enroll now"}
          </Button>
        ) : isFree ? (
          <Button variant="brand" onClick={handleFreeEnroll} disabled={enrollFree.isPending}>
            {enrollFree.isPending ? "Enrolling…" : "Enroll for free"}
          </Button>
        ) : (
          <CheckoutButton courseId={course.id} onSuccess={() => navigate(`/app/student/courses/${course.id}`)} />
        )}
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Curriculum</h2>
        {modules.map((module) => (
          <div key={module.id} className="rounded-md border">
            <div className="border-b bg-secondary/50 px-4 py-2 font-medium">{module.title}</div>
            <ul>
              {module.lessons?.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-2 border-b px-4 py-2 text-sm last:border-b-0">
                  {lesson.is_free_preview || enrollment ? (
                    <PlayCircle className="size-4 text-muted-foreground" />
                  ) : (
                    <Lock className="size-4 text-muted-foreground" />
                  )}
                  {lesson.title}
                  {lesson.is_free_preview && <span className="ml-auto text-xs text-brand">Free preview</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
