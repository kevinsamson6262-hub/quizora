import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { rankPlayers, type Player } from "@/lib/quizora";
import { AvatarBubble } from "./arena";

function AnimatedScore({ value }: { value: number }) {
  const target = useMotionValue(0);
  const spring = useSpring(target, { stiffness: 85, damping: 18 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    target.set(value);
  }, [target, value]);

  return <motion.span>{rounded}</motion.span>;
}

export function Leaderboard({ players, limit = 5, highlightId }: { players: Player[]; limit?: number; highlightId?: string }) {
  const ranked = rankPlayers(players).slice(0, limit);
  return (
    <ol className="flex w-full flex-col gap-3">
      {ranked.map((p, i) => (
        <motion.li
          layout
          key={p.id}
          initial={{ opacity: 0, x: -45, scale: .96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 24 }}
          className={cn(
            "glass flex items-center gap-4 rounded-2xl px-5 py-3 transition-shadow",
            p.id === highlightId && "ring-2 ring-primary shadow-glow",
            i < 3 && "border-white/20",
          )}
        >
          <span className={cn("font-display w-8 text-2xl", i === 0 ? "text-gold" : i === 1 ? "text-silver" : i === 2 ? "text-bronze" : "text-muted-foreground")}>
            {i + 1}
          </span>
          <motion.div animate={i < 3 ? { y: [0, -3, 0] } : undefined} transition={{ duration: 2.8 + i * .3, repeat: Infinity, ease: "easeInOut" }}>
            <AvatarBubble avatar={p.avatar} size="sm" />
          </motion.div>
          <span className="flex-1 truncate text-lg font-semibold">{p.nickname}</span>
          {p.streak >= 2 && <span className="text-sm text-accent">🔥{p.streak}</span>}
          <span className="font-display text-2xl tabular-nums"><AnimatedScore value={p.score} /></span>
        </motion.li>
      ))}
    </ol>
  );
}

export function Podium({ players }: { players: Player[] }) {
  const ranked = rankPlayers(players);
  const [first, second, third] = ranked;
  const slots = [
    { p: second, h: "h-32 sm:h-40", tone: "bg-silver", place: 2, delay: .55, label: "SECOND" },
    { p: first, h: "h-44 sm:h-56", tone: "bg-gold", place: 1, delay: .85, label: "FIRST" },
    { p: third, h: "h-24 sm:h-32", tone: "bg-bronze", place: 3, delay: .3, label: "THIRD" },
  ];

  return (
    <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/15 px-3 pb-4 pt-8 backdrop-blur-sm sm:px-8 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,.28),transparent_65%)]" />
      <motion.div className="absolute left-1/2 top-4 -translate-x-1/2 text-xs font-bold uppercase tracking-[.35em] text-white/45" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
        Final podium
      </motion.div>
      <div className="relative flex min-h-[360px] items-end justify-center gap-2 sm:min-h-[440px] sm:gap-5">
        {slots.map(({ p, h, tone, place, delay, label }) =>
          p ? (
            <motion.div key={p.id} initial={{ opacity: 0, y: 130, scale: .75 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: "spring", stiffness: 115, damping: 13 }} className="relative flex w-[31%] max-w-52 flex-col items-center gap-2">
              <motion.div animate={{ y: [0, -9, 0], rotate: place === 1 ? [-1.5, 1.5, -1.5] : [0, 0, 0] }} transition={{ duration: 3.4 + place * .35, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
                {place === 1 && <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-gold/20 blur-2xl" />}
                <AvatarBubble avatar={p.avatar} size={place === 1 ? "xl" : "lg"} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay + .35 }} className="max-w-full text-center">
                <p className="truncate text-sm font-black sm:text-lg">{p.nickname}</p>
                <p className="text-[10px] font-bold tracking-[.2em] text-muted-foreground sm:text-xs">{label}</p>
                <p className="mt-1 font-display text-lg sm:text-2xl"><AnimatedScore value={p.score} /> pts</p>
              </motion.div>
              <motion.div initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: delay + .15, duration: .45 }} style={{ transformOrigin: "bottom" }} className={cn("relative flex w-full items-start justify-center rounded-t-[2rem] border-x border-t border-white/15 pt-3 text-5xl font-black text-black/35 shadow-2xl sm:text-7xl", h, tone)}>
                <span>{place}</span>
                {place === 1 && <Sparkles className="absolute right-2 top-2 size-5 text-white/60 sm:size-7" />}
              </motion.div>
            </motion.div>
          ) : <div key={place} className="w-[31%] max-w-52" />,
        )}
      </div>
      {ranked.length > 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25 }} className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Trophy className="size-4 text-gold" /> The arena has spoken.</motion.div>}
    </section>
  );
}

export function LeaderboardStage({ players, limit = 10, highlightId }: { players: Player[]; limit?: number; highlightId?: string }) {
  return (
    <div className="w-full space-y-7">
      <Podium players={players} />
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="font-display text-2xl">Live standings</p>
          <span className="text-xs uppercase tracking-[.2em] text-muted-foreground">Top {Math.min(limit, players.length)}</span>
        </div>
        <Leaderboard players={players} limit={limit} highlightId={highlightId} />
      </div>
    </div>
  );
}
