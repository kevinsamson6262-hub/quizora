import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Pencil, Plus, Trash2, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createGame, createQuiz, deleteQuiz, listMyQuizzes } from "@/lib/firestore";
import { firebaseAuth, signOut } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/quizora/arena";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your quizzes — QUIZORA" },
      { name: "description", content: "Create, edit and launch live quiz battles." },
      { property: "og:title", content: "Your quizzes — QUIZORA" },
      { property: "og:description", content: "Create, edit and launch live quiz battles." },
    ],
  }),
  component: Dashboard,
});

const SAMPLE = [
  { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], correct_index: 1 },
  { text: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct_index: 3 },
  { text: "How many legs does a spider have?", options: ["6", "8", "10", "12"], correct_index: 1 },
  { text: "Which gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correct_index: 2 },
  { text: "What is 7 × 8?", options: ["54", "56", "64", "48"], correct_index: 1 },
];

function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const user = firebaseAuth.currentUser;
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes", user?.uid],
    enabled: Boolean(user),
    queryFn: () => listMyQuizzes(user!.uid),
  });

  async function makeQuiz(sample: boolean) {
    try {
      if (!user) throw new Error("Please sign in again.");
      const id = await createQuiz(user.uid, sample ? "Arena Warm-up" : "Untitled quiz", sample ? SAMPLE.map((q) => ({ ...q, time_limit: 20, points: 1000 })) : undefined);
      await qc.invalidateQueries({ queryKey: ["quizzes", user.uid] });
      toast.success(sample ? "Sample quiz ready — hit Play!" : "Quiz created");
      if (!sample) navigate({ to: "/quiz/$quizId", params: { quizId: id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  async function host(quizId: string) {
    try {
      if (!user) throw new Error("Please sign in again.");
      const gameId = await createGame(user.uid, quizId);
      navigate({ to: "/host/$gameId", params: { gameId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  async function remove(id: string) {
    if (!user || !confirm("Delete this quiz?")) return;
    try { await deleteQuiz(user.uid, id); await qc.invalidateQueries({ queryKey: ["quizzes", user.uid] }); }
    catch (error) { toast.error(error instanceof Error ? error.message : String(error)); }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-3 py-6">
        <Logo />
        <Button variant="ghost" onClick={() => signOut(firebaseAuth).then(() => navigate({ to: "/" }))}>
          <LogOut /> Sign out
        </Button>
      </header>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl">Your Arena</h1>
          <p className="text-muted-foreground">Build a quiz, press play, share the PIN.</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <Button variant="glass" size="lg" onClick={() => makeQuiz(true)}>
            <Sparkles /> Sample quiz
          </Button>
          <Button variant="arena" size="lg" onClick={() => makeQuiz(false)}>
            <Plus /> New quiz
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : quizzes.length === 0 ? (
        <div className="glass rounded-4xl p-12 text-center">
          <p className="font-display text-3xl">No quizzes yet</p>
          <p className="mt-2 text-muted-foreground">Start with the sample quiz to try a live game in seconds.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {quizzes.map((q) => {
            const count = q.questionCount ?? 0;
            return (
              <div key={q.id} className="glass flex flex-col gap-4 rounded-3xl p-6">
                <div>
                  <h2 className="truncate text-3xl">{q.title}</h2>
                  <p className="text-sm text-muted-foreground">{count} question{count === 1 ? "" : "s"}</p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button variant="arena" className="flex-1" onClick={() => host(q.id)} disabled={count === 0}>
                    <Play className="fill-current" /> Play live
                  </Button>
                  <Button asChild variant="glass" size="icon" aria-label="Edit">
                    <Link to="/quiz/$quizId" params={{ quizId: q.id }}>
                      <Pencil />
                    </Link>
                  </Button>
                  <Button variant="glass" size="icon" aria-label="Delete" onClick={() => remove(q.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
