import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePlatformTenants, useUpdateTenantStatus } from "@/hooks/data/useSuperAdmin";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminDashboardPage() {
  const { profile } = useAuth();
  const { data: tenants, isLoading } = usePlatformTenants();
  const updateStatus = useUpdateTenantStatus();

  const totalStudents = tenants?.reduce((sum, t) => sum + t.studentCount, 0) ?? 0;
  const totalCourses = tenants?.reduce((sum, t) => sum + t.courseCount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.name}</h1>
        <p className="text-muted-foreground">Platform overview — all institutes.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Institutes" value={tenants?.length ?? "—"} loading={isLoading} />
        <StatCard label="Students (platform-wide)" value={totalStudents} loading={isLoading} />
        <StatCard label="Courses (platform-wide)" value={totalCourses} loading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Institutes</CardTitle>
          <CardDescription>Approve, suspend, or reactivate institute access.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && tenants?.length === 0 && (
            <p className="text-sm text-muted-foreground">No institutes yet.</p>
          )}
          {tenants && tenants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Institute</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Students</th>
                    <th className="pb-2 font-medium">Courses</th>
                    <th className="pb-2 font-medium">Created</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.slug}</p>
                      </td>
                      <td className="py-3 capitalize">{t.subscription_plan}</td>
                      <td className="py-3">
                        <Badge variant={t.status === "active" ? "success" : t.status === "trial" ? "outline" : "secondary"}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3">{t.studentCount}</td>
                      <td className="py-3">{t.courseCount}</td>
                      <td className="py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        {t.status === "suspended" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate(
                                { tenantId: t.id, status: "active" },
                                { onSuccess: () => toast.success(`${t.name} reactivated`) },
                              )
                            }
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate(
                                { tenantId: t.id, status: "suspended" },
                                { onSuccess: () => toast.success(`${t.name} suspended`) },
                              )
                            }
                          >
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
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
