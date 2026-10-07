import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getQuiz, saveQuiz } from "@/lib/firestore";
import { firebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ANSWER_STYLES } from "@/components/quizora/arena";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/quiz/$quizId")({
  head: () => ({
    meta: [
      { title: "Quiz builder — QUIZORA" },
      { name: "description", content: "Write questions, set timers and points for your live quiz." },
      { property: "og:title", content: "Quiz builder — QUIZORA" },
      { property: "og:description", content: "Write questions, set timers and points for your live quiz." },
    ],
  }),
  component: Editor,
});

interface Draft {
  id?: string;
  text: string;
  options: string[];
  correct_index: number;
  time_limit: number;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

const blank = (): Draft => ({ text: "", options: ["", "", "", ""], correct_index: 0, time_limit: 20, points: 1000, difficulty: "medium" });

function Editor() {
  const { quizId } = Route.useParams();
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState<Draft[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!firebaseAuth.currentUser) throw new Error("Please sign in again.");
        const quiz = await getQuiz(firebaseAuth.currentUser.uid, quizId);
        setTitle(String(quiz.title ?? ""));
        setQs(quiz.questions.length ? quiz.questions.map((q) => ({ id: q.id, text: q.text, options: q.options, correct_index: q.correct_index, time_limit: q.time_limit, points: q.points, difficulty: q.difficulty ?? "medium" })) : [blank()]);
      } catch (error) { toast.error(error instanceof Error ? error.message : String(error)); }
      finally { setLoading(false); }
    })();
  }, [quizId]);

  const update = (i: number, patch: Partial<Draft>) => setQs((prev) => prev.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  async function save() {
    for (const [i, q] of qs.entries()) {
      if (!q.text.trim() || q.options.some((o) => !o.trim())) {
        return void toast.error(`Question ${i + 1} needs text and all 4 answers.`);
      }
    }
    setSaving(true);
    try {
      if (!firebaseAuth.currentUser) throw new Error("Please sign in again.");
      const saved = await saveQuiz(firebaseAuth.currentUser.uid, quizId, title, qs);
      setQs(saved.questions.map((q) => ({ id: q.id, text: q.text, options: q.options, correct_index: q.correct_index, time_limit: q.time_limit, points: q.points, difficulty: q.difficulty })));
      setRemoved([]);
      toast.success("Quiz saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally { setSaving(false); }
  }

  if (loading) return <p className="p-10 text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-5 pb-32">
      <header className="sticky top-0 z-10 -mx-5 mb-6 flex items-center gap-3 bg-background/70 px-5 py-4 backdrop-blur">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz title"
          className="font-display h-12 flex-1 border-none bg-transparent text-3xl! shadow-none"
        />
        <Button variant="arena" size="lg" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        {qs.map((q, i) => (
          <div key={q.id ?? `new-${i}`} className="glass rounded-3xl p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="font-display text-xl text-primary">Question {i + 1}</span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={q.time_limit}
                  onChange={(e) => update(i, { time_limit: Number(e.target.value) })}
                  className="h-9 rounded-xl bg-muted px-3 text-sm"
                  aria-label="Time limit"
                >
                  {[5, 10, 20, 30, 60, 90].map((t) => (
                    <option key={t} value={t}>{t}s</option>
                  ))}
                </select>
                <select
                  value={q.points}
                  onChange={(e) => update(i, { points: Number(e.target.value) })}
                  className="h-9 rounded-xl bg-muted px-3 text-sm"
                  aria-label="Points"
                >
                  {[0, 500, 1000, 2000].map((p) => (
                    <option key={p} value={p}>{p === 0 ? "No points" : `${p} pts`}</option>
                  ))}
                </select>
                <select
                  value={q.difficulty}
                  onChange={(e) => update(i, { difficulty: e.target.value as Draft["difficulty"] })}
                  className="h-9 rounded-xl bg-muted px-3 text-sm"
                  aria-label="Difficulty"
                >
                  <option value="easy">Easy · ×1</option>
                  <option value="medium">Medium · ×1.5</option>
                  <option value="hard">Hard · ×2</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete question"
                  onClick={() => {
                    if (q.id) setRemoved((r) => [...r, q.id!]);
                    setQs((prev) => prev.filter((_, j) => j !== i));
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <div className="mb-3 text-xs text-muted-foreground">Difficulty changes the base score: Easy ×1 · Medium ×1.5 · Hard ×2. Fast correct answers can earn up to 100% of that score.</div>
            <textarea
              value={q.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="Type your question…"
              rows={2}
              className="mb-4 w-full resize-none rounded-2xl bg-background/50 p-4 text-xl font-semibold outline-none ring-1 ring-border focus:ring-primary"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {q.options.map((opt, k) => {
                const S = ANSWER_STYLES[k]!;
                const Icon = S.icon;
                return (
                  <div key={k} className={cn("flex items-center gap-2 rounded-2xl p-2", S.bg)}>
                    <Icon className="ml-2 size-5 shrink-0 fill-current text-primary-foreground" />
                    <input
                      value={opt}
                      onChange={(e) => update(i, { options: q.options.map((o, m) => (m === k ? e.target.value : o)) })}
                      placeholder={`Answer ${k + 1}`}
                      className="h-10 min-w-0 flex-1 rounded-xl bg-background/85 px-3 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => update(i, { correct_index: k })}
                      aria-label="Mark correct"
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary-foreground/60",
                        q.correct_index === k && "bg-success border-success",
                      )}
                    >
                      {q.correct_index === k && <Check className="size-5 text-primary-foreground" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <Button variant="glass" size="lg" className="h-16 border-dashed" onClick={() => setQs((p) => [...p, blank()])}>
          <Plus /> Add question
        </Button>
      </div>
    </div>
  );
}
