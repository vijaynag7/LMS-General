import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMyEnrollments } from "@/hooks/data/useEnrollment";
import { useUpcomingClassesForStudent, useMyQuizScores } from "@/hooks/data/useStudentAnalytics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const { data: enrollments } = useMyEnrollments();
  const { data: upcoming } = useUpcomingClassesForStudent();
  const { data: scores } = useMyQuizScores();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.name}</h1>
        <p className="text-muted-foreground">Your progress, upcoming classes, and scores.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My progress</CardTitle>
            <CardDescription>{enrollments?.length ?? 0} enrolled courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollments?.slice(0, 5).map((e) => (
              <Link key={e.id} to={`/app/student/courses/${e.course_id}`} className="block">
                <p className="text-sm font-medium">{e.courses?.title}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-brand" style={{ width: `${Math.min(100, Number(e.progress_percent))}%` }} />
                </div>
              </Link>
            ))}
            {enrollments?.length === 0 && <p className="text-sm text-muted-foreground">No enrollments yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming?.slice(0, 5).map((session, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{session.lessons?.title}</p>
                <p className="text-muted-foreground">{new Date(session.scheduled_at).toLocaleString()}</p>
              </div>
            ))}
            {upcoming?.length === 0 && <p className="text-sm text-muted-foreground">No upcoming classes.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scores?.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between text-sm">
                <span>{attempt.quizzes?.title}</span>
                <span className="font-medium">{attempt.score}</span>
              </div>
            ))}
            {scores?.length === 0 && <p className="text-sm text-muted-foreground">No quiz attempts yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
