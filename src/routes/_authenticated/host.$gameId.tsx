import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Maximize2, Settings2, SkipForward, Users, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { getQuestions, kickPlayer, setGameState, subscribeAnswerCounts, updateGameSettings } from "@/lib/firestore";
import { firebaseAuth } from "@/lib/firebase";
import { useLiveGame, useNow } from "@/hooks/use-live-game";
import { AnswerTile, AvatarBubble, HudPill, Logo, TimerRing } from "@/components/quizora/arena";
import { Confetti, GameBurst, useGameSound } from "@/components/quizora/game-effects";
import { Leaderboard, LeaderboardStage, Podium } from "@/components/quizora/leaderboard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { QUIZORA_GLOBAL_THEME, DIFFICULTY_MULTIPLIER, questionTheme, secondsLeft, type GameStatus, type Question } from "@/lib/quizora";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/host/$gameId")({
  head: () => ({ meta: [{ title: "Live Arena — QUIZORA" }, { name: "description", content: "Host a real-time QUIZORA game." }] }),
  component: Host,
});

function Host() {
  const { gameId } = Route.useParams();
  const { game, players } = useLiveGame(gameId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [answered, setAnswered] = useState(0);
  const [answerCountQuestion, setAnswerCountQuestion] = useState(-1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showAnswerCount, setShowAnswerCount] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speedScoring, setSpeedScoring] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(100);
  const now = useNow();
  const beep = useGameSound(soundEnabled);

  useEffect(() => {
    if (!game) return;
    setAutoNext(game.auto_next ?? false);
    setShowLeaderboard(game.show_leaderboard ?? true);
    setShowAnswerCount(game.show_answer_count ?? true);
    setSoundEnabled(game.sound_enabled ?? true);
    setSpeedScoring(game.speed_scoring ?? true);
    setMaxPlayers(game.max_players ?? 100);
    void getQuestions(game).then(setQuestions).catch((error) => toast.error(error instanceof Error ? error.message : String(error)));
  }, [game?.quiz_id, game?.id]);

  const idx = game?.current_index ?? -1;
  const q = idx >= 0 ? questions[idx] : undefined;
  const validTimeLimit =
  q &&
  Number.isFinite(Number(q.time_limit)) &&
  Number(q.time_limit) > 0
    ? Number(q.time_limit)
    : null;

const left =
  game?.status === "question" &&
  game?.question_started_at &&
  validTimeLimit !== null
    ? secondsLeft(
        game.question_started_at,
        validTimeLimit,
        now,
      )
    : null;

  useEffect(() => {
    if (idx < 0) return;

    // Reset the previous question's answer state immediately when the
    // host moves to a new question. Firestore's new snapshot arrives
    // asynchronously, so keeping the old count here can make the
    // auto-reveal effect think that everyone has already answered.
    setCounts([0, 0, 0, 0]);
    setAnswered(0);
    setAnswerCountQuestion(-1);

    let active = true;
    const questionIndex = idx;

    const unsub = subscribeAnswerCounts(gameId, questionIndex, (c, total) => {
      if (!active) return;
      setCounts(c);
      setAnswered(total);
      setAnswerCountQuestion(questionIndex);
    });

    return () => {
      active = false;
      unsub();
    };
  }, [gameId, idx]);

  async function setState(status: GameStatus, index: number) {
    try {
      if (!firebaseAuth.currentUser) throw new Error("Host session expired.");
      await setGameState(firebaseAuth.currentUser.uid, gameId, status, index);
      if (status === "question") beep("select");
    } catch (error) { toast.error(error instanceof Error ? error.message : String(error)); }
  }

  async function saveSettings() {
    try {
      if (!firebaseAuth.currentUser) throw new Error("Host session expired.");
      await updateGameSettings(firebaseAuth.currentUser.uid, gameId, { theme: QUIZORA_GLOBAL_THEME.id, max_players: maxPlayers, auto_next: autoNext, show_leaderboard: showLeaderboard, show_answer_count: showAnswerCount, sound_enabled: soundEnabled, speed_scoring: speedScoring });
      toast.success("Arena settings saved"); setSettingsOpen(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : String(error)); }
  }

  useEffect(() => {
    if (
      game?.status !== "question" ||
      !q ||
      left === null
    ) {
      return;
    }

    // Do not use the previous question's answer count while the new
    // Firestore listener is attaching. The count is considered valid
    // only after a snapshot for this exact question index arrives.
    const allPlayersAnswered =
      answerCountQuestion === idx &&
      players.length > 0 &&
      answered >= players.length;

    const timerFinished = left <= 0;

    if (timerFinished || allPlayersAnswered) {
      void setState("reveal", idx);
    }
  }, [
    left,
    answerCountQuestion,
    answered,
    players.length,
    game?.status,
    q,
    idx,
  ]);

  useEffect(() => {
    if (game?.status !== "reveal" || !autoNext) return;
    const t = window.setTimeout(() => void setState("leaderboard", idx), 2600);
    return () => window.clearTimeout(t);
  }, [game?.status, autoNext, idx]);

  if (!game) return <div className="flex min-h-screen items-center justify-center font-display text-3xl animate-pulse">Opening arena…</div>;
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?pin=${game.pin}` : "";
  const isLast = idx >= game.total_questions - 1;
  const themeData = QUIZORA_GLOBAL_THEME;
  const roundTheme = q ? questionTheme(idx, q.theme_id) : null;
  const correctCount = q ? counts[q.correct_index] ?? 0 : 0;
  const defeatedCount = Math.max(0, players.length - correctCount);

  return <div className="relative min-h-screen overflow-hidden">
    <motion.div key="global-neon" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: .18, scale: 1 }} transition={{ duration: .7 }} className="pointer-events-none fixed inset-0 -z-10" style={{ background: themeData.background }} />
    <div className={cn("mx-auto flex min-h-screen flex-col px-5 py-4", presentation ? "max-w-none" : "max-w-[1500px]")}>
      <header className="mb-5 flex items-center justify-between gap-3">
        {!presentation && <Logo />}
        <div className="ml-auto flex items-center gap-2">
          <HudPill>PIN <span className="font-display text-lg tracking-widest">{game.pin}</span></HudPill>
          <HudPill><Users className="size-4" /> {players.length}/{game.max_players ?? 100}</HudPill>
          {idx >= 0 && <HudPill>Q {idx + 1}/{game.total_questions}</HudPill>}
          {!presentation && <Button variant="glass" size="icon" onClick={() => setSettingsOpen((v) => !v)} aria-label="Settings"><Settings2 /></Button>}
          <Button variant="glass" size="icon" onClick={() => setPresentation((v) => !v)} aria-label="Presentation mode"><Maximize2 /></Button>
        </div>
      </header>

      {game.status === "lobby" && <main className="flex flex-1 flex-col gap-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="glass rounded-[2rem] p-7 sm:p-10">
            <p className="text-sm uppercase tracking-[.25em] text-muted-foreground">Join the arena</p>
            <p className="font-display text-gradient-title text-7xl tracking-widest sm:text-9xl">{game.pin}</p>
            <h1 className="mt-2 text-3xl sm:text-5xl">{game.quiz_title}</h1>
            <p className="mt-3 text-muted-foreground">Scan the QR code or visit <b className="text-foreground">{joinUrl.replace(/\?.*/, "")}</b></p>
            <div className="mt-6 flex flex-wrap gap-3"><HudPill>{themeData.emoji} {themeData.label}</HudPill><HudPill>👥 {players.length}/{game.max_players ?? 100}</HudPill><HudPill>⚡ {speedScoring ? "Speed scoring" : "Classic scoring"}</HudPill></div>
          </section>
          <section className="flex flex-col items-center justify-center rounded-[2rem] bg-white p-6 shadow-2xl"><QRCodeSVG value={joinUrl} size={230} level="H" /><p className="mt-3 font-display text-xl text-slate-900">SCAN TO JOIN</p><p className="text-sm text-slate-500">PIN {game.pin}</p></section>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-display text-3xl">{players.length} challenger{players.length === 1 ? "" : "s"} connected</p><p className="text-muted-foreground">Everyone in this arena sees the same theme, player roster and live standings.</p></div><Button variant="arena" size="xl" disabled={players.length === 0} onClick={() => void setState("question", 0)}><Zap className="fill-current" /> Start battle</Button></div>
        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section className="glass rounded-[2rem] p-6">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl">Connected players</h2><HudPill>🟢 {players.length} online</HudPill></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{players.map((p) => <motion.div layout key={p.id} className="glass group flex items-center gap-3 rounded-2xl p-3"><AvatarBubble avatar={p.avatar} size="sm" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.nickname}</p><p className="text-xs text-muted-foreground">Ready to play</p></div><button aria-label={`Kick ${p.nickname}`} onClick={() => void (firebaseAuth.currentUser ? kickPlayer(firebaseAuth.currentUser.uid, gameId, p.id).catch((error) => toast.error(error instanceof Error ? error.message : String(error))) : Promise.resolve())} className="opacity-40 hover:opacity-100"><X className="size-4" /></button></motion.div>)}</div>
          </section>
        </div>
      </main>}

      {(game.status === "question" || game.status === "reveal") && q && <main className="flex flex-1 flex-col gap-5">
        <div className="flex items-center justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm uppercase tracking-[.25em] text-muted-foreground">Question {idx + 1}</p>{roundTheme && <HudPill>{roundTheme[2]} {roundTheme[1]}</HudPill>}<HudPill>{q.difficulty.toUpperCase()} · ×{DIFFICULTY_MULTIPLIER[q.difficulty]}</HudPill></div><h1 className={cn("mt-1 font-display text-4xl sm:text-6xl", presentation && "sm:text-7xl")}>{q.text}</h1></div>{game.status === "question" && <TimerRing left={left ?? q.time_limit} total={q.time_limit} />}</div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-5 py-3"><div className="text-sm text-muted-foreground">{showAnswerCount ? <>ANSWERS <b className="font-display text-2xl text-foreground">{answered}/{players.length}</b></> : "Answer counter hidden"}</div><div className="flex gap-2">{game.status === "question" ? <Button variant="glass" onClick={() => void setState("reveal", idx)}><SkipForward /> Reveal now</Button> : <Button variant="arena" onClick={() => void setState("leaderboard", idx)}><ChevronRight /> Continue</Button>}</div></div>
        <div className="grid flex-1 gap-4 sm:grid-cols-2">{q.options.map((o, i) => <AnswerTile key={i} index={i} text={o} big disabled count={game.status === "reveal" ? counts[i] : undefined} state={game.status === "reveal" ? (i === q.correct_index ? "correct" : "wrong") : "idle"} />)}</div>
        {game.status === "reveal" && <div className="relative overflow-hidden text-center font-display text-2xl text-success"><GameBurst type={correctCount > 0 ? "correct" : "wrong"} />{q.options[q.correct_index]} is correct! <span className="text-foreground">{correctCount} got it</span> · <span className="text-accent">{defeatedCount} missed it 🤣</span>{autoNext && <span className="ml-2 text-muted-foreground">Next screen incoming…</span>}</div>}
      </main>}

      {game.status === "leaderboard" && <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6"><div className="flex items-center justify-between"><div><p className="text-sm uppercase tracking-[.25em] text-muted-foreground">Round complete</p><h1 className="text-5xl">Leaderboard</h1></div><Button variant="arena" size="xl" onClick={() => void setState(isLast ? "finished" : "question", isLast ? idx : idx + 1)}>{isLast ? "Finish game" : "Next question"}<ChevronRight /></Button></div>{showLeaderboard ? <LeaderboardStage players={players} limit={10} /> : <div className="glass rounded-3xl p-10 text-center font-display text-3xl">Leaderboard hidden by host.</div>}</main>}

      {game.status === "finished" && <main className="relative flex flex-1 flex-col items-center justify-center gap-8 text-center"><Confetti /><GameBurst type="win" /><h1 className="text-gradient-title text-7xl sm:text-9xl">Final Results</h1><p className="font-display text-3xl">1st place has conquered the arena · {players.filter((p) => p.score === 0).length} players left scoreless 🤣</p><Podium players={players} /><div className="w-full max-w-2xl"><Leaderboard players={players} limit={10} /></div><Button asChild variant="arena" size="lg"><Link to="/dashboard">Back to dashboard</Link></Button></main>}
    </div>

    <AnimatePresence>{settingsOpen && !presentation && game.status === "lobby" && <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl">Arena settings</h2><p className="text-sm text-muted-foreground">Tune the room before launch.</p></div><Button variant="glass" size="icon" onClick={() => setSettingsOpen(false)}><X /></Button></div>
      <div className="mt-7 space-y-7"><section><p className="mb-3 font-semibold">Shared theme</p><div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-glow"><div className="flex items-center gap-3"><span className="text-3xl">{QUIZORA_GLOBAL_THEME.emoji}</span><div><p className="font-semibold">{QUIZORA_GLOBAL_THEME.label}</p><p className="text-xs text-muted-foreground">The same arena theme is used across every QUIZORA page and participant screen.</p></div><Check className="ml-auto size-5 text-primary" /></div></div></section>
      <label className="block"><span className="font-semibold">Player capacity</span><input type="range" min="2" max="200" step="1" value={maxPlayers} onChange={(e) => setMaxPlayers(+e.target.value)} className="mt-3 w-full" /><span className="font-display text-2xl">{maxPlayers}</span></label>
      <div className="space-y-4">{[["auto", "Auto next question", autoNext, setAutoNext], ["leader", "Show leaderboard", showLeaderboard, setShowLeaderboard], ["count", "Show answer count", showAnswerCount, setShowAnswerCount], ["sound", "Game sounds", soundEnabled, setSoundEnabled], ["speed", "Speed scoring", speedScoring, setSpeedScoring]].map(([key, label, value, setter]) => <div key={String(key)} className="flex items-center justify-between rounded-2xl bg-muted/30 p-4"><div><p className="font-semibold">{String(label)}</p><p className="text-xs text-muted-foreground">{key === "auto" ? "Advance after the reveal automatically." : key === "speed" ? "Reward faster correct answers." : "Control the projector experience."}</p></div><Switch checked={Boolean(value)} onCheckedChange={setter as (v: boolean) => void} /></div>)}</div>
      <Button variant="arena" size="lg" className="w-full" onClick={() => void saveSettings()}>Save arena settings</Button>
      </div>
    </motion.aside>}</AnimatePresence>
  </div>;
}
