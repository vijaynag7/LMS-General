import { Link } from "react-router-dom";
import { useUpcomingLiveSessions } from "@/hooks/data/useFacultyCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default function FacultyLivePage() {
  const { data: sessions, isLoading } = useUpcomingLiveSessions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Live Classes</h1>
        <p className="text-muted-foreground">Upcoming and in-progress sessions.</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && sessions?.length === 0 && <p className="text-sm text-muted-foreground">No live classes scheduled.</p>}
      <div className="space-y-3">
        {sessions?.map((session) => (
          <Card key={session.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{session.lessons?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {session.lessons?.modules?.courses?.title} · {new Date(session.scheduled_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={session.status === "live" ? "success" : "outline"}>{session.status}</Badge>
                <Link
                  to={`/app/faculty/courses/${session.lessons?.modules?.course_id}?lesson=${session.lesson_id}`}
                  className={buttonVariants({ size: "sm", variant: "brand" })}
                >
                  Manage
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
