import { useAuth } from "@/hooks/useAuth";
import { useFacultyAnalytics } from "@/hooks/data/useAnalytics";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FacultyDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useFacultyAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.name}</h1>
        <p className="text-muted-foreground">Your classes, attendance, and student engagement.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Sessions with attendance" value={data?.sessionsWithAttendance} loading={isLoading} />
        <StatCard label="Avg. time in class (min)" value={data?.avgAttendanceMinutes} loading={isLoading} />
        <StatCard label="Quiz attempts" value={data?.totalQuizAttempts} loading={isLoading} suffix={` (${data?.completedQuizzes ?? 0} completed)`} />
        <StatCard label="Assignment submissions" value={data?.totalSubmissions} loading={isLoading} suffix={` (${data?.gradedSubmissions ?? 0} graded)`} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  suffix,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  suffix?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">
          {loading ? "…" : value ?? 0}
          {!loading && suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
