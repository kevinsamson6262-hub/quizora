import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  getMyAnswer,
  getPlayerQuestion,
  submitAnswer,
  subscribeAnswerCounts,
  updatePlayerProfile,
} from "@/lib/firestore";

import { useLiveGame, useNow } from "@/hooks/use-live-game";

import {
  AnswerTile,
  AvatarBubble,
  HudPill,
  Logo,
  TimerRing,
} from "@/components/quizora/arena";

import { LeaderboardStage } from "@/components/quizora/leaderboard";

import {
  Confetti,
  GameBurst,
  useGameSound,
} from "@/components/quizora/game-effects";

import { Button } from "@/components/ui/button";

import {
  AVATARS,
  QUIZORA_GLOBAL_THEME,
  loadPlayerSession,
  questionTheme,
  rankPlayers,
  shuffleAvatars,
  type PlayerQuestion,
  type PlayerSession,
} from "@/lib/quizora";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/$gameId")({
  ssr: false,

  head: () => ({
    meta: [
      {
        title: "In the arena — QUIZORA",
      },
      {
        name: "description",
        content: "Answer fast and climb the leaderboard.",
      },
      {
        property: "og:title",
        content: "In the arena — QUIZORA",
      },
      {
        property: "og:description",
        content: "Answer fast and climb the leaderboard.",
      },
    ],
  }),

  component: Play,
});

interface MyAnswer {
  choice: number;
  correct: boolean;
  points: number;
  basePoints?: number;
  speedFactor?: number;
  difficulty?: string;
  elapsedSeconds?: number;
}

/**
 * Fisher-Yates shuffle.
 *
 * Returns a new array and never modifies the original array.
 */
function shuffleOptions<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function Play() {
  const { gameId } = Route.useParams();

  const [session, setSession] =
    useState<PlayerSession | null>(null);

  const [checked, setChecked] = useState(false);

  const { game, players } = useLiveGame(gameId);

  const [q, setQ] =
    useState<PlayerQuestion | null>(null);

  const [picked, setPicked] =
    useState<number | null>(null);

  const [mine, setMine] =
    useState<MyAnswer | null>(null);

  const [counts, setCounts] = useState<number[]>([
    0,
    0,
    0,
    0,
  ]);

  const [answered, setAnswered] = useState(0);

  const [editName, setEditName] = useState("");

  const [editAvatar, setEditAvatar] =
    useState("anime-ninja");

  const [editing, setEditing] = useState(false);

  /**
   * Random avatar order for this player.
   */
  const randomizedAvatars = useMemo(
    () => shuffleAvatars(AVATARS),
    [],
  );

  /**
   * Random answer order for this player.
   *
   * Each object contains:
   *
   * text  -> answer displayed to the player
   * index -> original answer index from Firebase
   *
   * We MUST submit `option.index`, not `displayIndex`.
   */
  const shuffledOptions = useMemo(() => {
    if (!q) return [];

    const options = q.options.map(
      (text, index) => ({
        text,
        index,
      }),
    );

    return shuffleOptions(options);
  }, [q]);

  const beep = useGameSound(
    game?.sound_enabled ?? true,
  );

  const now = useNow();

  useEffect(() => {
    setSession(loadPlayerSession(gameId));
    setChecked(true);
  }, [gameId]);

  const status = game?.status;

  const idx = game?.current_index ?? -1;

  /**
   * Load the current question.
   *
   * Keep this effect tied only to the game/question identity. The live
   * game object changes frequently, and using the whole object as a
   * dependency can restart the async request while a round is changing.
   * Cancelling stale requests also prevents an older question from
   * overwriting the current one.
   */
  useEffect(() => {
    if (!game || idx < 0) return;

    let cancelled = false;

    // Clear the previous question immediately. This prevents old answer
    // buttons from being displayed during a question transition.
    setQ(null);

    getPlayerQuestion(gameId, idx)
      .then((question) => {
        if (!cancelled) {
          setQ(question);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQ(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, idx]);

  /**
   * Reset/load this player's answer independently from question loading.
   */
  useEffect(() => {
    if (!session || idx < 0) return;

    if (status === "question") {
      setPicked(null);
      setMine(null);
      return;
    }

    getMyAnswer(
      gameId,
      session.player_id,
      idx,
    )
      .then(setMine)
      .catch(() => setMine(null));
  }, [
    gameId,
    idx,
    status,
    session,
  ]);

  /**
   * Subscribe to answer counts during reveal
   * and leaderboard stages.
   */
  useEffect(() => {
    if (
      idx < 0 ||
      (status !== "reveal" &&
        status !== "leaderboard")
    ) {
      return;
    }

    return subscribeAnswerCounts(
      gameId,
      idx,
      (c, total) => {
        setCounts(c);
        setAnswered(total);
      },
    );
  }, [gameId, idx, status]);

  /**
   * Submit an answer.
   *
   * `originalIndex` is the index from the original
   * question options, NOT the randomized display position.
   */
  async function answer(originalIndex: number) {
    if (!session || picked !== null) return;

    setPicked(originalIndex);

    try {
      await submitAnswer(
        gameId,
        session.player_id,
        idx,
        originalIndex,
      );
    } catch (error) {
      setPicked(null);

      toast.error(
        error instanceof Error
          ? error.message
          : String(error),
      );
    }
  }

  if (!checked || !game) {
    return (
      <Center>
        <p className="font-display text-3xl animate-pulse">
          Loading arena…
        </p>
      </Center>
    );
  }

  const me = players.find(
    (p) => p.id === session?.player_id,
  );

  if (!session || !me) {
    return (
      <Center>
        <p className="font-display text-3xl">
          You're not in this game
        </p>

        <Button
          asChild
          variant="arena"
          size="lg"
        >
          <Link
            to="/join"
            search={{ pin: game.pin }}
          >
            Join
          </Link>
        </Button>
      </Center>
    );
  }

  const rank =
    rankPlayers(players).findIndex(
      (p) => p.id === me.id,
    ) + 1;

  const playerSeconds =
    q && game
      ? Math.max(
          0,
          Math.ceil(
            q.time_limit -
              ((
                now -
                new Date(
                  game.question_started_at ??
                    Date.now(),
                ).getTime()
              ) /
                1000),
          ),
        )
      : 0;

  const roundTheme = q
    ? questionTheme(idx, q.theme_id)
    : null;

  const activeTheme =
    QUIZORA_GLOBAL_THEME;

  const lobbyTheme =
    QUIZORA_GLOBAL_THEME;

  const correctCount =
    q?.correct_index != null
      ? counts[q.correct_index] ?? 0
      : 0;

  const wrongCount = Math.max(
    0,
    answered - correctCount,
  );

  const roundMessage = mine?.correct
    ? correctCount <= 1
      ? "😎 YOU WERE THE ONE!"
      : correctCount <= 5
        ? `🔥 ${correctCount} legends got it!`
        : `🤯 WOW! ${correctCount} players got me!`
    : mine
      ? wrongCount >=
        Math.max(
          5,
          Math.ceil(
            players.length * 0.5,
          ),
        )
        ? `🤣 HA HA! ${wrongCount} got fooled!`
        : "😂 Nice try! The arena got you this time!"
      : "⏰ Too slow! The clock ate your chance!";

  const responseSeconds =
    mine?.elapsedSeconds ?? null;

  const responseRatio =
    responseSeconds != null && q
      ? responseSeconds /
        Math.max(1, q.time_limit)
      : null;

  const responseQuote =
    responseRatio == null
      ? null
      : responseRatio <= 0.35
        ? "⚡ Lightning reflexes — you barely gave the clock time to react!"
        : responseRatio <= 0.7
          ? "🔥 Nice pace — quick enough to keep the pressure on!"
          : "🐢 The clock noticed that one — next round, trust your first instinct!";

  /**
   * Save player's nickname and avatar.
   */
  async function saveProfile() {
    if (!session) return;

    try {
      await updatePlayerProfile(
        gameId,
        session.player_id,
        editName.trim() || me.nickname,
        editAvatar,
      );

      setEditing(false);

      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : String(error),
      );
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-xl flex-col overflow-hidden px-4 py-4">
      <motion.div
        key="global-neon"
        initial={{
          opacity: 0,
          scale: 1.08,
        }}
        animate={{
          opacity: 0.18,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
        }}
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            QUIZORA_GLOBAL_THEME.background,
        }}
      />

      <header className="mb-4 flex items-center justify-between">
        <HudPill>
          <AvatarBubble
            avatar={me.avatar}
            size="sm"
          />

          {me.nickname}
        </HudPill>

        <HudPill>
          <span className="font-display text-lg">
            {me.score.toLocaleString()}
          </span>
        </HudPill>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {status !== "lobby" && (
          <motion.div
            key={activeTheme.id}
            initial={{
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            className="glass rounded-full px-4 py-2 text-sm font-bold"
          >
            {activeTheme.emoji}{" "}
            {activeTheme.label}
          </motion.div>
        )}

        {status === "lobby" && (
          <div className="w-full space-y-5">
            <motion.div
              initial={{
                y: -18,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              className="text-center"
            >
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <HudPill>
                  👥 {players.length}/
                  {game.max_players ?? 100}
                </HudPill>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl">
                {game.quiz_title}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                You’re in the room. Wait for the
                host to start the battle.
              </p>
            </motion.div>

            {!editing ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="glass"
                  onClick={() => {
                    setEditName(
                      me.nickname,
                    );
                    setEditAvatar(
                      me.avatar,
                    );
                    setEditing(true);
                  }}
                >
                  <Pencil />
                  Change name / avatar
                </Button>

                <HudPill>
                  <span className="size-2 animate-pulse rounded-full bg-success" />
                  Room live
                </HudPill>
              </div>
            ) : (
              <div className="glass mx-auto w-full max-w-xl rounded-3xl p-5">
                <input
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value,
                    )
                  }
                  maxLength={20}
                  className="mb-4 h-12 w-full rounded-xl bg-background/60 px-4 font-semibold outline-none ring-1 ring-border focus:ring-primary"
                  placeholder="Nickname"
                />

                <div className="mb-4 max-h-[360px] overflow-y-auto rounded-2xl border border-white/10 bg-black/15 p-3">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {randomizedAvatars.map(
                      (a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() =>
                            setEditAvatar(
                              a.id,
                            )
                          }
                          className={cn(
                            "group flex min-w-0 flex-col items-center rounded-2xl p-2 transition-transform hover:-translate-y-1",
                            editAvatar ===
                              a.id &&
                              "bg-primary/10 ring-2 ring-primary shadow-glow",
                          )}
                        >
                          <AvatarBubble
                            avatar={a.id}
                            size="lg"
                          />

                          <span className="mt-1 w-full truncate text-center text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                            {a.name}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="arena"
                    onClick={() =>
                      void saveProfile()
                    }
                  >
                    Save
                  </Button>

                  <Button
                    variant="glass"
                    onClick={() =>
                      setEditing(false)
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <section className="lobby-room min-h-[520px] p-4 sm:p-7">
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.25em] text-muted-foreground">
                    The player room
                  </p>

                  <h2 className="font-display mt-1 text-2xl sm:text-3xl">
                    Everyone’s here
                  </h2>
                </div>

                <HudPill>
                  🟢 {players.length} online
                </HudPill>
              </div>

              <div className="relative z-10 mt-5 flex min-h-[390px] flex-col justify-end">
                <div className="lobby-floor" />

                <div className="relative z-10 grid max-h-[560px] grid-cols-2 gap-x-2 gap-y-5 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {players.map((p) => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{
                        opacity: 0,
                        scale: 0.6,
                        y: 30,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      className={cn(
                        "lobby-player",
                        p.id === me.id &&
                          "lobby-player-you",
                      )}
                    >
                      <div className="lobby-player-card">
                        <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {p.id === me.id
                            ? "You"
                            : "Player"}
                        </span>

                        <AvatarBubble
                          avatar={p.avatar}
                          size={
                            players.length >
                            30
                              ? "md"
                              : "lg"
                          }
                        />

                        <span className="lobby-player-name mt-2">
                          {p.nickname}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {status === "question" && q && (
          <div className="flex w-full flex-col gap-6">
            <div className="flex items-center justify-end">
              <TimerRing
                left={playerSeconds}
                total={q.time_limit}
              />
            </div>

            {picked === null ? (
              <div className="grid grid-cols-1 gap-4">
                {shuffledOptions.map(
                  (
                    option,
                    displayIndex,
                  ) => (
                    <AnswerTile
                      /*
                       * Do NOT use q.id here.
                       * PlayerQuestion doesn't contain an id.
                       */
                      key={`${option.index}-${option.text}`}
                      index={displayIndex}
                      text={option.text}
                      onClick={() => {
                        beep("select");

                        /*
                         * IMPORTANT:
                         *
                         * displayIndex:
                         * randomized position shown to player.
                         *
                         * option.index:
                         * original question option index.
                         *
                         * Firebase must receive option.index.
                         */
                        void answer(
                          option.index,
                        );
                      }}
                      big
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="glass rounded-4xl p-10">
                <p className="font-display text-3xl">
                  Locked in!
                </p>

                <p className="text-muted-foreground">
                  Fingers crossed…
                </p>
              </div>
            )}
          </div>
        )}

        {(status === "reveal" ||
          status === "leaderboard") && (
          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="relative glass w-full rounded-4xl p-8 animate-pop"
          >
            {mine?.correct ? (
              <Confetti />
            ) : (
              <GameBurst
                type={
                  mine ? "wrong" : null
                }
              />
            )}

            <div className="text-6xl">
              {mine?.correct
                ? "🏆"
                : mine
                  ? "🤣"
                  : "⏰"}
            </div>

            <p
              className={`mt-3 font-display text-4xl ${
                mine?.correct
                  ? "text-success"
                  : "text-accent"
              }`}
            >
              {roundMessage}
            </p>

            {mine && (
              <p className="mt-3 font-display text-3xl">
                +{mine.points} points
              </p>
            )}

            {mine?.correct && (
              <p className="mt-2 text-sm text-muted-foreground">
                {mine.difficulty?.toUpperCase()}{" "}
                ·{" "}
                {Math.round(
                  (mine.speedFactor ??
                    1) * 100,
                )}
                % speed multiplier
              </p>
            )}

            {responseQuote && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mx-auto mt-4 max-w-xl rounded-2xl bg-white/[.06] px-4 py-3 text-sm font-semibold text-foreground/85"
              >
                {responseQuote}
              </motion.p>
            )}

            {q?.correct_index != null && (
              <p className="mt-4 text-muted-foreground">
                Correct answer:{" "}
                <b className="text-foreground">
                  {
                    q.options[
                      q.correct_index
                    ]
                  }
                </b>
              </p>
            )}

            <p className="mt-4 font-semibold">
              You're #{rank} of{" "}
              {players.length}
              {me.streak >= 2
                ? ` · 🔥 ${me.streak} streak`
                : ""}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {correctCount} correct ·{" "}
              {wrongCount} wrong
            </p>
          </motion.div>
        )}

        {status === "leaderboard" && (
          <section className="glass w-full rounded-4xl p-5 text-left">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">
                Leaderboard
              </h2>

              <HudPill>
                #{rank} /{" "}
                {players.length}
              </HudPill>
            </div>

            <LeaderboardStage
              players={players}
              limit={10}
              highlightId={me.id}
            />
          </section>
        )}

        {status === "finished" && (
          <motion.div
            initial={{
              scale: 0.65,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="relative flex w-full flex-col gap-5"
          >
            {rank <= 3 && <Confetti />}

            <div className="text-7xl">
              {rank === 1
                ? "🏆"
                : rank === 2
                  ? "🥈"
                  : rank === 3
                    ? "🥉"
                    : "🤣"}
            </div>

            <h1 className="text-5xl text-gradient-title">
              {rank === 1
                ? "YOU CONQUERED QUIZORA!"
                : rank <= 3
                  ? "PODIUM FINISH!"
                  : "🤣 YOU GOT DEFEATED!"}
            </h1>

            <p className="font-display text-3xl">
              {rank === 1
                ? "⚡ Absolutely unstoppable."
                : rank <= 3
                  ? `🔥 You finished #${rank}! Massive performance.`
                  : "Haa haa! You are a loser this round 🤣🤣🤣 — train hard and come back stronger!"}
            </p>

            <LeaderboardStage
              players={players}
              limit={10}
              highlightId={me.id}
            />

            <Button
              asChild
              variant="arena"
              size="lg"
            >
              <Link to="/">
                Play again
              </Link>
            </Button>
          </motion.div>
        )}
      </main>

      <footer className="py-3 text-center">
        <Logo className="text-lg" />
      </footer>
    </div>
  );
}

function Center({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
      {children}
    </div>
  );
}