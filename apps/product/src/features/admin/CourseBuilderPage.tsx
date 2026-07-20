import * as React from "react";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Video, HelpCircle, ClipboardList, File, Upload, X } from "lucide-react";
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
  useUploadLessonContent,
  type ModuleWithLessons,
} from "@/hooks/data/useCurriculum";
import { useQuizForLesson, useCreateQuiz, useCreateQuestion, useDeleteQuestion } from "@/hooks/data/useAssessments";
import type { Database, LessonType } from "@edusaas/shared";
import { useLiveSessionForLesson, useUpdateLiveSessionSchedule } from "@/hooks/data/useLiveSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

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
  const [detailsOpen, setDetailsOpen] = React.useState(false);

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
    if (!newModuleTitle.trim()) {
      toast.error("Enter a module title first");
      return;
    }
    try {
      await createModule.mutateAsync({ title: newModuleTitle, order: modules?.length ?? 0 });
      setNewModuleTitle("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add module");
    }
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
          <Button size="sm" variant="outline" onClick={() => setDetailsOpen((v) => !v)}>
            {detailsOpen ? "Close details" : "Edit details"}
          </Button>
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

      {detailsOpen && course && (
        <CourseDetailsForm
          course={course}
          onSaved={() => setDetailsOpen(false)}
          updateCourse={updateCourse}
        />
      )}

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

function CourseDetailsForm({
  course,
  updateCourse,
  onSaved,
}: {
  course: CourseRow;
  updateCourse: ReturnType<typeof useUpdateCourse>;
  onSaved: () => void;
}) {
  const [description, setDescription] = React.useState(course.description ?? "");
  const [durationLabel, setDurationLabel] = React.useState(course.duration_label ?? "");
  const [price, setPrice] = React.useState(String(course.price));

  const save = async () => {
    try {
      await updateCourse.mutateAsync({
        description,
        durationLabel: durationLabel || undefined,
        price: Number(price),
      });
      toast.success("Course details updated");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update course");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Course details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="details-description">Description</Label>
          <Textarea
            id="details-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="details-duration">Duration</Label>
            <Input
              id="details-duration"
              placeholder="e.g. 8 weeks"
              value={durationLabel}
              onChange={(e) => setDurationLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="details-price">
              Price ({course.currency})
            </Label>
            <Input
              id="details-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <Button size="sm" variant="brand" onClick={save} disabled={updateCourse.isPending}>
          {updateCourse.isPending ? "Saving…" : "Save details"}
        </Button>
      </CardContent>
    </Card>
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
    if (!newLessonTitle.trim()) {
      toast.error("Enter a lesson title first");
      return;
    }
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
              {(lesson.type === "document" || lesson.type === "recorded") && (
                <ContentUploader lesson={lesson} courseId={courseId} />
              )}
              {lesson.type === "quiz" && <QuizEditor lessonId={lesson.id} lessonTitle={lesson.title} />}
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

type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];

function ContentUploader({ lesson, courseId }: { lesson: LessonRow; courseId: string }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const uploadContent = useUploadLessonContent(courseId);
  const contentRef = lesson.content_ref as { path?: string; url?: string } | null;
  const fileName = contentRef?.path?.split("/").pop();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadContent.mutateAsync({ lessonId: lesson.id, file });
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
      <span>{fileName ? `Attached: ${fileName}` : "No file attached yet"}</span>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
      <Button
        size="sm"
        variant="outline"
        className="h-7"
        disabled={uploadContent.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {uploadContent.isPending ? "Uploading…" : fileName ? "Replace file" : "Upload file"}
      </Button>
    </div>
  );
}

function QuizEditor({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const { data: quiz } = useQuizForLesson(lessonId);
  const createQuiz = useCreateQuiz(lessonId, lessonTitle);
  const createQuestion = useCreateQuestion(lessonId, quiz?.id);
  const deleteQuestion = useDeleteQuestion(lessonId);

  const [prompt, setPrompt] = React.useState("");
  const [options, setOptions] = React.useState(["", ""]);
  const [correctIndex, setCorrectIndex] = React.useState(0);
  const [marks, setMarks] = React.useState(1);

  if (!quiz) {
    return (
      <div className="pl-6">
        <Button size="sm" variant="outline" onClick={() => createQuiz.mutate()} disabled={createQuiz.isPending}>
          {createQuiz.isPending ? "Setting up…" : "Set up quiz questions"}
        </Button>
      </div>
    );
  }

  const resetForm = () => {
    setPrompt("");
    setOptions(["", ""]);
    setCorrectIndex(0);
    setMarks(1);
  };

  const addQuestion = async () => {
    if (!prompt.trim() || options.some((o) => !o.trim())) {
      toast.error("Fill in the question and every option");
      return;
    }
    try {
      await createQuestion.mutateAsync({
        type: "mcq",
        prompt,
        options,
        correctOptionIndex: correctIndex,
        marks,
        orderIndex: quiz.questions?.length ?? 0,
      });
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add question");
    }
  };

  return (
    <div className="space-y-3 pl-6">
      {quiz.questions?.map((q, i) => (
        <div key={q.id} className="rounded-md border px-3 py-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">
              {i + 1}. {q.prompt} <span className="text-muted-foreground">({q.marks} marks)</span>
            </span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => deleteQuestion.mutate(q.id)}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <ul className="mt-1.5 space-y-0.5">
            {((q.options as string[] | null) ?? []).map((opt, oi) => (
              <li key={oi} className={oi === q.correct_option_index ? "font-medium text-brand" : "text-muted-foreground"}>
                {opt}
                {oi === q.correct_option_index ? " ✓" : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="space-y-2 rounded-md border border-dashed px-3 py-3">
        <Input
          placeholder="Question"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-8 text-xs"
        />
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              aria-label={`Correct answer is option ${i + 1}`}
            />
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              className="h-8 text-xs"
            />
            {options.length > 2 && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setOptions(options.filter((_, oi) => oi !== i));
                  if (correctIndex >= i && correctIndex > 0) setCorrectIndex(correctIndex - 1);
                }}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOptions([...options, ""])}>
            <Plus className="size-3.5" /> Option
          </Button>
          <Label className="text-xs text-muted-foreground">Marks</Label>
          <Input
            type="number"
            min={0}
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
            className="h-7 w-16 text-xs"
          />
          <Button size="sm" className="ml-auto h-7 text-xs" onClick={addQuestion} disabled={createQuestion.isPending}>
            Add question
          </Button>
        </div>
      </div>
    </div>
  );
}
