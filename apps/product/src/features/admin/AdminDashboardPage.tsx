import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAnalytics } from "@/hooks/data/useAnalytics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useAdminAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.name}</h1>
        <p className="text-muted-foreground">Institute admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={data ? `₹${data.totalRevenue.toLocaleString()}` : "—"} loading={isLoading} />
        <StatCard label="Enrollments" value={data?.totalEnrollments ?? "—"} loading={isLoading} />
        <StatCard label="Active students" value={data?.activeStudents ?? "—"} loading={isLoading} />
        <StatCard label="Attendance records" value={data?.totalAttendanceRecords ?? "—"} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Last 14 days with sales</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data?.revenueTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course-wise sales</CardTitle>
            <CardDescription>Total revenue per course</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data?.courseSales.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.courseSales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="title" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{loading ? "…" : value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function EmptyState() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet</div>;
}
