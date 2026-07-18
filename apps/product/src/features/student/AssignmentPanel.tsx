import * as React from "react";
import { toast } from "sonner";
import { useAssignmentForLesson, useMySubmission, useSubmitAssignment } from "@/hooks/data/useAssessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function AssignmentPanel({ lessonId, title }: { lessonId: string; title: string }) {
  const { data: assignment, isLoading } = useAssignmentForLesson(lessonId);
  const assignmentId = assignment?.id;
  const { data: submission } = useMySubmission(assignmentId);
  const submit = useSubmitAssignment(assignmentId ?? "");
  const [fileUrl, setFileUrl] = React.useState("");

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!assignment) return <p className="text-sm text-muted-foreground">No assignment attached to this lesson yet.</p>;

  const handleSubmit = async () => {
    if (!fileUrl.trim()) return;
    try {
      await submit.mutateAsync(fileUrl.trim());
      toast.success("Assignment submitted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm">{assignment.instructions}</p>
          <p className="text-sm text-muted-foreground">
            Max marks: {assignment.max_marks}
            {assignment.due_at && ` · Due ${new Date(assignment.due_at).toLocaleString()}`}
          </p>

          {submission ? (
            <div className="rounded-md border bg-secondary/40 p-3 text-sm">
              <p>Submitted {new Date(submission.submitted_at).toLocaleString()}</p>
              <a href={submission.file_url ?? "#"} target="_blank" rel="noreferrer" className="text-brand underline underline-offset-4">
                View submission
              </a>
              {submission.grade !== null && (
                <p className="mt-2 font-medium">
                  Grade: {submission.grade} / {assignment.max_marks}
                </p>
              )}
              {submission.feedback && <p className="mt-1 text-muted-foreground">{submission.feedback}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fileUrl">Submission link</Label>
              <Input
                id="fileUrl"
                placeholder="https://drive.google.com/…"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <Button variant="brand" onClick={handleSubmit} disabled={submit.isPending}>
                {submit.isPending ? "Submitting…" : "Submit"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
