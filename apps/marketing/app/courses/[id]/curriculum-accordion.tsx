"use client";

import * as React from "react";
import { ChevronDown, PlayCircle, Lock, Video, FileText, HelpCircle, ClipboardList } from "lucide-react";
import type { Database, LessonType } from "@edusaas/shared";

type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
type ModuleWithLessons = ModuleRow & { lessons: LessonRow[] };

const LESSON_ICON: Record<LessonType, typeof Video> = {
  live: Video,
  recorded: Video,
  document: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
};

export function CurriculumAccordion({ modules }: { modules: ModuleWithLessons[] }) {
  const [openId, setOpenId] = React.useState<string | null>(modules[0]?.id ?? null);

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {modules.map((module) => {
        const lessons = (module.lessons ?? []).slice().sort((a, b) => a.order_index - b.order_index);
        const isOpen = openId === module.id;
        return (
          <div key={module.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : module.id)}
              className="flex w-full items-center justify-between gap-4 bg-muted/40 px-5 py-4 text-left"
            >
              <span className="font-medium">{module.title}</span>
              <span className="flex items-center gap-3 text-xs text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {isOpen && (
              <ul>
                {lessons.map((lesson) => {
                  const Icon = LESSON_ICON[lesson.type];
                  return (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 border-t border-border px-5 py-3 text-sm text-muted-foreground"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{lesson.title}</span>
                      {lesson.is_free_preview ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
                          <PlayCircle className="size-3.5" /> Free preview
                        </span>
                      ) : (
                        <Lock className="size-3.5 shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
