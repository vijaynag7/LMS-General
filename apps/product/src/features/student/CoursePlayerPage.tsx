import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PlayCircle, HelpCircle, ClipboardList, File as FileIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCourseCatalogDetail } from "@/hooks/data/useCatalog";
import { usePlaybackUrl } from "@/hooks/data/useEnrollment";
import type { LessonType } from "@edusaas/shared";
import QuizPlayer from "./QuizPlayer";
import AssignmentPanel from "./AssignmentPanel";
import LiveClassRoom from "@/features/live/LiveClassRoom";

interface LessonSummary {
  id: string;
  title: string;
  type: LessonType;
}

const ICON: Record<LessonType, typeof Video> = {
  live: Video,
  recorded: Video,
  document: FileIcon,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: course, isLoading } = useCourseCatalogDetail(courseId);

  const modules = course?.modules ?? [];
  const allLessons = modules.flatMap((m) => m.lessons ?? []);
  const activeLessonId = searchParams.get("lesson") ?? allLessons[0]?.id;
  const activeLesson = allLessons.find((l) => l.id === activeLessonId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!course) return <p className="text-sm text-muted-foreground">Course not found.</p>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3">
        <h2 className="font-semibold">{course.title}</h2>
        {modules.map((module) => (
          <div key={module.id}>
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{module.title}</p>
            <ul className="space-y-1">
              {module.lessons?.map((lesson) => {
                const Icon = ICON[lesson.type];
                return (
                  <li key={lesson.id}>
                    <button
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                        lesson.id === activeLessonId ? "bg-brand text-brand-foreground" : "hover:bg-accent",
                      )}
                      onClick={() => setSearchParams({ lesson: lesson.id })}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </aside>

      <div>{activeLesson ? <LessonContent lesson={activeLesson} /> : <p className="text-sm text-muted-foreground">No lessons yet.</p>}</div>
    </div>
  );
}

function LessonContent({ lesson }: { lesson: LessonSummary }) {
  if (lesson.type === "quiz") return <QuizPlayer lessonId={lesson.id} title={lesson.title} />;
  if (lesson.type === "assignment") return <AssignmentPanel lessonId={lesson.id} title={lesson.title} />;
  if (lesson.type === "document") return <DocumentViewer lessonId={lesson.id} title={lesson.title} />;
  if (lesson.type === "live") return <LiveClassRoom lessonId={lesson.id} title={lesson.title} />;
  return <VideoPlayer lessonId={lesson.id} title={lesson.title} />;
}

function VideoPlayer({ lessonId, title }: { lessonId: string; title: string }) {
  const playbackUrl = usePlaybackUrl();
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUrl(null);
    setError(null);
    playbackUrl
      .mutateAsync(lessonId)
      .then(setUrl)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load video"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex aspect-video items-center justify-center rounded-lg bg-black text-white">
        {url && (
          <video src={url} controls className="h-full w-full rounded-lg">
            <track kind="captions" />
          </video>
        )}
        {!url && !error && <PlayCircle className="size-12 opacity-50" />}
        {error && <p className="px-4 text-center text-sm text-red-300">{error}</p>}
      </div>
    </div>
  );
}

function DocumentViewer({ lessonId, title }: { lessonId: string; title: string }) {
  const playbackUrl = usePlaybackUrl();
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    playbackUrl.mutateAsync(lessonId).then(setUrl).catch(() => setUrl(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="text-brand underline underline-offset-4">
          Open document
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">No document attached yet.</p>
      )}
    </div>
  );
}
