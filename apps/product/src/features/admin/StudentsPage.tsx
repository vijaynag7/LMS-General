import * as React from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useProfilesByRole } from "@/hooks/data/useProfiles";
import { useInviteUser } from "@/hooks/data/useInviteUser";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StudentsPage() {
  const { data: students, isLoading } = useProfilesByRole("student");
  const inviteUser = useInviteUser();
  const [csv, setCsv] = React.useState("");
  const [importing, setImporting] = React.useState(false);

  const importCsv = async () => {
    const rows = csv
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.split(",").map((c) => c.trim()));

    if (rows.length === 0) return;
    setImporting(true);
    let ok = 0;
    for (const [name, email, phone] of rows) {
      if (!name || !email) continue;
      try {
        await inviteUser.mutateAsync({ name, email, phone, role: "student" });
        ok++;
      } catch {
        // continue with remaining rows; a per-row failure shouldn't abort the batch
      }
    }
    setImporting(false);
    setCsv("");
    toast.success(`Invited ${ok} of ${rows.length} students`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-muted-foreground">Bulk-invite students or manage existing enrollees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk import</CardTitle>
          <CardDescription>One student per line: name, email, phone (phone optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="csv">CSV rows</Label>
            <Textarea
              id="csv"
              rows={5}
              placeholder={"Priya Sharma, priya@example.com, 9876543210\nRahul Verma, rahul@example.com"}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
          </div>
          <Button onClick={importCsv} disabled={importing || !csv.trim()} variant="brand">
            <Upload className="size-4" /> {importing ? "Importing…" : "Import students"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {students?.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted-foreground">{s.phone ?? "No phone on file"}</p>
            </div>
          </div>
        ))}
        {students?.length === 0 && <p className="text-sm text-muted-foreground">No students yet.</p>}
      </div>
    </div>
  );
}
