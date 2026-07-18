import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useBatches, useCreateBatch, useBatchStudents, useAddStudentToBatch } from "@/hooks/data/useBatches";
import { useCourses } from "@/hooks/data/useCourses";
import { useProfilesByRole } from "@/hooks/data/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BatchesPage() {
  const { data: batches, isLoading } = useBatches();
  const { data: courses } = useCourses();
  const createBatch = useCreateBatch();
  const [name, setName] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [expandedBatch, setExpandedBatch] = React.useState<string | null>(null);

  const addBatch = async () => {
    if (!name.trim() || !courseId) return;
    try {
      await createBatch.mutateAsync({ courseId, name });
      setName("");
      toast.success("Batch created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create batch");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Batches</h1>
        <p className="text-muted-foreground">Group students by cohort and timing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New batch</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Course</label>
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-56">
              <option value="">Select a course</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Batch name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Batch A — Evening" />
          </div>
          <Button onClick={addBatch} disabled={createBatch.isPending} variant="brand">
            <Plus className="size-4" /> Create
          </Button>
        </CardContent>
      </Card>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="space-y-3">
        {batches?.map((batch) => (
          <Card key={batch.id}>
            <CardHeader
              className="cursor-pointer flex-row items-center justify-between space-y-0"
              onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
            >
              <div>
                <CardTitle className="text-base">{batch.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{batch.courses?.title}</p>
              </div>
            </CardHeader>
            {expandedBatch === batch.id && <BatchStudents batchId={batch.id} />}
          </Card>
        ))}
      </div>
    </div>
  );
}

function BatchStudents({ batchId }: { batchId: string }) {
  const { data: batchStudents } = useBatchStudents(batchId);
  const { data: allStudents } = useProfilesByRole("student");
  const addStudent = useAddStudentToBatch(batchId);
  const [selected, setSelected] = React.useState("");

  const memberIds = new Set(batchStudents?.map((bs) => bs.student_id));
  const available = allStudents?.filter((s) => !memberIds.has(s.id)) ?? [];

  return (
    <CardContent className="space-y-3 border-t pt-4">
      <div className="flex gap-2">
        <Select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-64">
          <option value="">Add a student…</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          onClick={() => selected && addStudent.mutate(selected)}
          disabled={!selected || addStudent.isPending}
        >
          Add
        </Button>
      </div>
      <ul className="space-y-1 text-sm">
        {batchStudents?.map((bs) => (
          <li key={bs.student_id}>{bs.profiles?.name}</li>
        ))}
      </ul>
    </CardContent>
  );
}
