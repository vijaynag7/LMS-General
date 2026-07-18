import * as React from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { useProfilesByRole } from "@/hooks/data/useProfiles";
import { useInviteUser } from "@/hooks/data/useInviteUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacultyPage() {
  const { data: faculty, isLoading } = useProfilesByRole("faculty");
  const inviteUser = useInviteUser();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const invite = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      await inviteUser.mutateAsync({ name, email, role: "faculty" });
      toast.success(`Invite sent to ${email}`);
      setName("");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invite");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Faculty</h1>
        <p className="text-muted-foreground">Invite instructors and manage their access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite faculty</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="faculty-name">Name</Label>
            <Input id="faculty-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="faculty-email">Email</Label>
            <Input id="faculty-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={invite} disabled={inviteUser.isPending} variant="brand">
            <UserPlus className="size-4" /> Invite
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {faculty?.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-sm text-muted-foreground">{f.phone ?? "No phone on file"}</p>
            </div>
          </div>
        ))}
        {faculty?.length === 0 && <p className="text-sm text-muted-foreground">No faculty invited yet.</p>}
      </div>
    </div>
  );
}
