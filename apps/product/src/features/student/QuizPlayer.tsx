import * as React from "react";
import { toast } from "sonner";
import { useQuizForLesson, useMyQuizAttempt, useSubmitQuizAttempt } from "@/hooks/data/useAssessments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function QuizPlayer({ lessonId, title }: { lessonId: string; title: string }) {
  const { data: quiz, isLoading } = useQuizForLesson(lessonId);
  const quizId = quiz?.id;
  const { data: attempt } = useMyQuizAttempt(quizId);
  const submit = useSubmitQuizAttempt(quizId ?? "");
  const [answers, setAnswers] = React.useState<Record<string, number>>({});

  const questions = (quiz?.questions ?? []).slice().sort((a, b) => a.order_index - b.order_index);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!quiz) return <p className="text-sm text-muted-foreground">No quiz attached to this lesson yet.</p>;

  if (attempt?.submitted_at) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">You already submitted this quiz.</p>
            <p className="mt-2 text-2xl font-semibold">Score: {attempt.score}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    let score = 0;
    for (const q of questions) {
      const selected = answers[q.id];
      if (selected === undefined) continue;
      if (selected === q.correct_option_index) score += Number(q.marks);
      else score -= Number(q.negative_marks);
    }
    try {
      await submit.mutateAsync({ answers, score });
      toast.success(`Submitted — score: ${score}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit quiz");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {questions.map((q, qi) => (
        <Card key={q.id}>
          <CardContent className="space-y-2 pt-6">
            <p className="font-medium">
              {qi + 1}. {q.prompt}
            </p>
            <div className="space-y-1">
              {((q.options as string[] | null) ?? []).map((option, oi) => (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={cn(
                    "block w-full rounded-md border px-3 py-2 text-left text-sm",
                    answers[q.id] === oi ? "border-brand bg-brand/10" : "hover:bg-accent",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Button variant="brand" onClick={handleSubmit} disabled={submit.isPending || questions.length === 0}>
        {submit.isPending ? "Submitting…" : "Submit quiz"}
      </Button>
    </div>
  );
}
