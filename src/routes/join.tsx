import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { joinGame } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Logo, AvatarBubble } from "@/components/quizora/arena";
import { AVATARS, savePlayerSession, shuffleAvatars } from "@/lib/quizora";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>) => ({ pin: typeof s.pin === "string" ? s.pin : "" }),
  head: () => ({
    meta: [
      { title: "Join a game — QUIZORA" },
      { name: "description", content: "Enter the PIN, pick your character and jump into the arena." },
      { property: "og:title", content: "Join a game — QUIZORA" },
      { property: "og:description", content: "Enter the PIN, pick your character and jump in." },
    ],
  }),
  component: Join,
});

function Join() {
  const { pin: initial } = Route.useSearch();
  const navigate = useNavigate();
  const [pin, setPin] = useState(initial);
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState<string>(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]?.id ?? "anime-ninja");
  const [busy, setBusy] = useState(false);
  const randomizedAvatars = useMemo(() => shuffleAvatars(AVATARS), []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await joinGame(pin, nick, avatar);
      savePlayerSession(s);
      navigate({ to: "/play/$gameId", params: { gameId: s.game_id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 py-10">
      <Logo className="text-4xl" />
      <form onSubmit={join} className="glass flex w-full max-w-md flex-col gap-4 rounded-4xl p-6">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="Game PIN"
          className="font-display h-16 rounded-2xl bg-background/60 text-center text-4xl tracking-[0.3em] outline-none ring-2 ring-border focus:ring-primary"
        />
        <input
          maxLength={20}
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Your nickname"
          className="h-14 rounded-2xl bg-background/60 px-4 text-center text-xl font-semibold outline-none ring-2 ring-border focus:ring-primary"
        />
        <p className="text-center text-sm text-muted-foreground">Pick your character</p>
        <div className="max-h-[330px] overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-2">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
            {randomizedAvatars.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => setAvatar(a.id)}
                className={cn("flex min-w-0 flex-col items-center rounded-2xl p-1 transition-transform hover:-translate-y-1", avatar === a.id ? "bg-primary/10 ring-2 ring-primary" : "opacity-75 hover:opacity-100")}
                aria-label={a.name}
              >
                <AvatarBubble avatar={a.id} size="lg" />
                <span className="w-full truncate text-center text-[9px] font-bold text-muted-foreground">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" variant="arena" size="xl" disabled={busy || pin.length !== 6 || !nick.trim()}>
          {busy ? "Joining…" : "Let's go!"}
        </Button>
      </form>
    </div>
  );
}
