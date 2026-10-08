import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo, AvatarBubble } from "@/components/quizora/arena";
import { AVATARS, shuffleAvatars } from "@/lib/quizora";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QUIZORA — Enter the Arena. Think Fast. Win Big." },
      { name: "description", content: "Host live quiz battles for 60+ players. Join with a PIN, answer fast, climb the leaderboard." },
      { property: "og:title", content: "QUIZORA — Enter the Arena" },
      { property: "og:description", content: "Live multiplayer quiz battles. Think fast. Win big." },
    ],
  }),
  component: Home,
});

function Home() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const featuredAvatars = useMemo(() => shuffleAvatars(AVATARS).slice(0, 16), []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <header className="relative z-20 flex items-center justify-between py-5 sm:py-7">
          <Logo />
          <Button asChild variant="glass">
            <Link to="/dashboard">Host a game</Link>
          </Button>
        </header>

        <main className="relative flex flex-1 items-center py-4 pb-10 sm:py-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="home-orb home-orb-one" />
            <span className="home-orb home-orb-two" />
            <span className="home-orb home-orb-three" />
          </div>

          <div className="relative z-10 grid w-full items-center gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <section className="home-copy order-2 text-center lg:order-1 lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-bold uppercase tracking-[.22em] text-muted-foreground backdrop-blur-xl">
                <span className="size-2 animate-pulse rounded-full bg-success" /> Developed by Kevin Samson, Karthikeyan, Mari Sankar.
              </div>
              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="text-gradient-title font-display text-[3.75rem] leading-[.84] tracking-tight sm:text-8xl lg:text-[7.8rem]"
              >
                QUIZORA
              </motion.h1>
              <p className="font-display mt-3 max-w-xl text-xl leading-tight text-foreground/90 sm:mt-5 sm:text-3xl lg:text-4xl">
                Enter the Arena. Think Fast. Win Big.
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base lg:mx-0">
                Join a live room, pick your character and battle everyone in real time.
              </p>

              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({ to: "/join", search: { pin } });
                }}
                className="glass mx-auto mt-5 w-full max-w-lg rounded-[1.5rem] p-3.5 sm:mt-7 sm:rounded-[2rem] sm:p-5 lg:mx-0"
              >
                <label htmlFor="pin" className="mb-2 block text-left text-xs font-bold uppercase tracking-[.22em] text-muted-foreground">
                  Enter a game PIN
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="pin"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="font-display h-14 min-w-0 flex-1 rounded-2xl bg-background/70 px-4 text-center text-3xl tracking-[.2em] outline-none ring-1 ring-border transition focus:ring-2 focus:ring-primary sm:h-16 sm:px-5 sm:text-4xl sm:text-left"
                  />
                  <Button type="submit" variant="arena" size="xl" disabled={pin.length !== 6} className="sm:px-8">
                    Enter Arena
                  </Button>
                </div>
              </motion.form>

              <p className="mt-4 text-xs text-muted-foreground sm:mt-5 sm:text-sm">
                Running the show?{" "}
                <Link to="/dashboard" className="font-semibold text-secondary hover:underline">
                  Create a quiz and host it live
                </Link>
              </p>
            </section>

            <motion.section
              initial={{ opacity: 0, x: 30, scale: .94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: .65, ease: "easeOut" }}
              className="home-room-wrap order-1 flex min-h-[340px] items-end justify-center lg:order-2 lg:min-h-[620px]"
            >
              <div className="home-character-room relative flex h-[335px] w-full max-w-[520px] items-end justify-center rounded-[2rem] border border-white/10 sm:h-[500px] sm:rounded-[3rem] lg:h-[590px]">
                <div className="home-room-grid" />
                <div className="home-room-light home-room-light-left" />
                <div className="home-room-light home-room-light-right" />
                <div className="relative z-20 grid h-[86%] w-[94%] grid-cols-4 items-end gap-x-1 gap-y-0.5 sm:h-[88%] sm:w-[92%] sm:grid-cols-4 sm:gap-x-3">
                  {featuredAvatars.map((avatar, i) => (
                    <motion.div
                      key={avatar.id}
                      animate={{ y: [0, -(5 + (i % 4) * 2), 0], rotate: [((i % 3) - 1) * 1.2, ((i % 3) - 1) * -1.2, ((i % 3) - 1) * 1.2] }}
                      transition={{ duration: 4.5 + (i % 5) * .45, delay: i * .12, repeat: Infinity, ease: "easeInOut" }}
                      className="flex min-w-0 flex-col items-center justify-end"
                    >
                      <AvatarBubble avatar={avatar.id} size="lg" />
                    </motion.div>
                  ))}
                </div>
                <div className="absolute left-5 top-7 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-xl sm:left-8 sm:top-9">
                  01 · READY
                </div>
                <div className="absolute right-5 top-7 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-xl sm:right-8 sm:top-9">
                  LIVE ROOM
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}
