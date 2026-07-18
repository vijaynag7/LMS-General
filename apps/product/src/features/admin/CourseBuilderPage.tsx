import * as React from "react";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Video, HelpCircle, ClipboardList, File } from "lucide-react";
import { toast } from "sonner";
import { useCourse, useUpdateCourse } from "@/hooks/data/useCourses";
import {
  useModules,
  useCreateModule,
  useReorderModules,
  useDeleteModule,
  useCreateLesson,
  useDeleteLesson,
  useUpdateLesson,
  type ModuleWithLessons,
} from "@/hooks/data/useCurriculum";
import type { LessonType } from "@edusaas/shared";
import { useLiveSessionForLesson, useUpdateLiveSessionSchedule } from "@/hooks/data/useLiveSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LESSON_ICON: Record<LessonType, typeof Video> = {
  live: Video,
  recorded: Video,
  document: File,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const { data: course } = useCourse(courseId);
  const { data: modules, isLoading } = useModules(courseId);
  const createModule = useCreateModule(courseId!);
  const reorderModules = useReorderModules(courseId!);
  const updateCourse = useUpdateCourse(courseId!);
  const [newModuleTitle, setNewModuleTitle] = React.useState("");

  const handleDragEnd = (event: DragEndEvent) => {
    if (!modules) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    reorderModules.mutate(reordered.map((m, i) => ({ id: m.id, order_index: i })));
  };

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    await createModule.mutateAsync({ title: newModuleTitle, order: modules?.length ?? 0 });
    setNewModuleTitle("");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{course?.title ?? "Course"}</h1>
          <p className="text-muted-foreground">Build your curriculum — drag modules to reorder.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course?.status === "published" ? "success" : "secondary"}>{course?.status}</Badge>
          {course?.status !== "published" && (
            <Button
              size="sm"
              variant="brand"
              onClick={() => updateCourse.mutate({ status: "published" })}
              disabled={updateCourse.isPending}
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {modules && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {modules.map((module) => (
                <SortableModule key={module.id} module={module} courseId={courseId!} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="New module title"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addModule()}
        />
        <Button onClick={addModule} disabled={createModule.isPending}>
          <Plus className="size-4" /> Add module
        </Button>
      </div>
    </div>
  );
}

function SortableModule({ module, courseId }: { module: ModuleWithLessons; courseId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const deleteModule = useDeleteModule(courseId);
  const createLesson = useCreateLesson(courseId, module.id);
  const deleteLesson = useDeleteLesson(courseId);
  const updateLesson = useUpdateLesson(courseId);
  const [newLessonTitle, setNewLessonTitle] = React.useState("");
  const [newLessonType, setNewLessonType] = React.useState<LessonType>("recorded");

  const style = { transform: CSS.Transform.toString(transform), transition };

  const addLesson = async () => {
    if (!newLessonTitle.trim()) return;
    try {
      await createLesson.mutateAsync({ title: newLessonTitle, type: newLessonType, order: module.lessons?.length ?? 0 });
      setNewLessonTitle("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add lesson");
    }
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground" aria-label="Drag to reorder">
            <GripVertical className="size-4" />
          </button>
          <CardTitle className="text-base">{module.title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={() => deleteModule.mutate(module.id)}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {module.lessons?.map((lesson) => {
          const Icon = LESSON_ICON[lesson.type];
          return (
            <div key={lesson.id} className="space-y-2 rounded-md border px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{lesson.title}</span>
                  {lesson.is_free_preview && <Badge variant="outline">Free preview</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateLesson.mutate({ id: lesson.id, is_free_preview: !lesson.is_free_preview })}
                  >
                    {lesson.is_free_preview ? "Unmark preview" : "Mark preview"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteLesson.mutate(lesson.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {lesson.type === "live" && <LiveScheduleEditor lessonId={lesson.id} />}
            </div>
          );
        })}
        <div className="flex gap-2 pt-1">
          <Select value={newLessonType} onChange={(e) => setNewLessonType(e.target.value as LessonType)} className="w-40">
            <option value="recorded">Recorded video</option>
            <option value="live">Live class</option>
            <option value="document">Document</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </Select>
          <Input
            placeholder="Lesson title"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLesson()}
          />
          <Button size="sm" onClick={addLesson} disabled={createLesson.isPending}>
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveScheduleEditor({ lessonId }: { lessonId: string }) {
  const { data: session } = useLiveSessionForLesson(lessonId);
  const updateSchedule = useUpdateLiveSessionSchedule(lessonId);

  if (!session) return null;

  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time, ISO strings are UTC.
  const localValue = new Date(session.scheduled_at).toISOString().slice(0, 16);

  return (
    <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
      <span>Scheduled:</span>
      <Input
        type="datetime-local"
        value={localValue}
        onChange={(e) => e.target.value && updateSchedule.mutate(new Date(e.target.value).toISOString())}
        className="h-7 w-auto text-xs"
      />
      <Badge variant={session.status === "live" ? "success" : "outline"}>{session.status}</Badge>
    </div>
  );
}
