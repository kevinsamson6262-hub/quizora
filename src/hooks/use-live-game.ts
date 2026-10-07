import { useEffect, useState } from "react";
import { subscribeGame } from "@/lib/firestore";
import type { Game, Player } from "@/lib/quizora";

export function useLiveGame(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => subscribeGame(gameId, setGame, setPlayers), [gameId]);
  return { game, players };
}

export function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
