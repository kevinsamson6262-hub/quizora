export const AVATARS = [
  {
    id: "q0",
    emoji: "👤",
    name: "Avatar 0",
    image: "/avatars/custom/q0.png",
  },
  {
    id: "q1",
    emoji: "👤",
    name: "Avatar 1",
    image: "/avatars/custom/q1.png",
  },
  {
    id: "q2",
    emoji: "👤",
    name: "Avatar 2",
    image: "/avatars/custom/q2.png",
  },
  {
    id: "q3",
    emoji: "👤",
    name: "Avatar 3",
    image: "/avatars/custom/q3.png",
  },
  {
    id: "q4",
    emoji: "👤",
    name: "Avatar 4",
    image: "/avatars/custom/q4.png",
  },
  {
    id: "q5",
    emoji: "👤",
    name: "Avatar 5",
    image: "/avatars/custom/q5.png",
  },
  {
    id: "q6",
    emoji: "👤",
    name: "Avatar 6",
    image: "/avatars/custom/q6.png",
  },
  {
    id: "q7",
    emoji: "👤",
    name: "Avatar 7",
    image: "/avatars/custom/q7.png",
  },
  {
    id: "q8",
    emoji: "👤",
    name: "Avatar 8",
    image: "/avatars/custom/q8.png",
  },
  {
    id: "q9",
    emoji: "👤",
    name: "Avatar 9",
    image: "/avatars/custom/q9.png",
  },
  {
    id: "q10",
    emoji: "👤",
    name: "Avatar 10",
    image: "/avatars/custom/q10.png",
  },
  {
    id: "q11",
    emoji: "👤",
    name: "Avatar 11",
    image: "/avatars/custom/q11.png",
  },
  {
    id: "q12",
    emoji: "👤",
    name: "Avatar 12",
    image: "/avatars/custom/q12.png",
  },
  {
    id: "q13",
    emoji: "👤",
    name: "Avatar 13",
    image: "/avatars/custom/q13.png",
  },
  {
    id: "q14",
    emoji: "👤",
    name: "Avatar 14",
    image: "/avatars/custom/q14.png",
  },
  {
    id: "q15",
    emoji: "👤",
    name: "Avatar 15",
    image: "/avatars/custom/q15.png",
  },
  {
    id: "q16",
    emoji: "👤",
    name: "Avatar 16",
    image: "/avatars/custom/q16.png",
  },
  {
    id: "q17",
    emoji: "👤",
    name: "Avatar 17",
    image: "/avatars/custom/q17.png",
  },
  {
    id: "q18",
    emoji: "👤",
    name: "Avatar 18",
    image: "/avatars/custom/q18.png",
  },
  {
    id: "q19",
    emoji: "👤",
    name: "Avatar 19",
    image: "/avatars/custom/q19.png",
  },
  {
    id: "q20",
    emoji: "👤",
    name: "Avatar 20",
    image: "/avatars/custom/q20.png",
  },
  {
    id: "q21",
    emoji: "👤",
    name: "Avatar 21",
    image: "/avatars/custom/q21.png",
  },
  {
    id: "q22",
    emoji: "👤",
    name: "Avatar 22",
    image: "/avatars/custom/q22.png",
  },
  {
    id: "q23",
    emoji: "👤",
    name: "Avatar 23",
    image: "/avatars/custom/q23.png",
  },
  {
    id: "q24",
    emoji: "👤",
    name: "Avatar 24",
    image: "/avatars/custom/q24.png",
  },
  {
    id: "q25",
    emoji: "👤",
    name: "Avatar 25",
    image: "/avatars/custom/q25.png",
  },
  {
    id: "q26",
    emoji: "👤",
    name: "Avatar 26",
    image: "/avatars/custom/q26.png",
  },
  {
    id: "q27",
    emoji: "👤",
    name: "Avatar 27",
    image: "/avatars/custom/q27.png",
  },
  {
    id: "q28",
    emoji: "👤",
    name: "Avatar 28",
    image: "/avatars/custom/q28.png",
  },
  {
    id: "q29",
    emoji: "👤",
    name: "Avatar 29",
    image: "/avatars/custom/q29.png",
  },
  {
    id: "q30",
    emoji: "👤",
    name: "Avatar 30",
    image: "/avatars/custom/q30.png",
  },
  {
    id: "q31",
    emoji: "👤",
    name: "Avatar 31",
    image: "/avatars/custom/q31.png",
  },
  {
    id: "q32",
    emoji: "👤",
    name: "Avatar 32",
    image: "/avatars/custom/q32.png",
  },
  {
    id: "q33",
    emoji: "👤",
    name: "Avatar 33",
    image: "/avatars/custom/q33.png",
  },
  {
    id: "q34",
    emoji: "👤",
    name: "Avatar 34",
    image: "/avatars/custom/q34.png",
  },
  {
    id: "q35",
    emoji: "👤",
    name: "Avatar 35",
    image: "/avatars/custom/q35.png",
  },
  {
    id: "q36",
    emoji: "👤",
    name: "Avatar 36",
    image: "/avatars/custom/q36.png",
  },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

/** Return a fresh randomized avatar order for each visitor/player. */
export function shuffleAvatars(source: readonly (typeof AVATARS)[number][] = AVATARS) {
  const copy = [...source];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function avatarEmoji(id: string): string {
  return AVATARS.find((a) => a.id === id)?.emoji ?? "🎮";
}

export type GameStatus = "lobby" | "question" | "reveal" | "leaderboard" | "finished";
export type ArenaTheme = "neon" | "space" | "jungle" | "candy" | "volcano" | "cyber" | "sunset" | "ocean" | "arcade" | "sky" | "lava" | "forest";
export const QUIZORA_GLOBAL_THEME = {
  id: "neon" as ArenaTheme,
  label: "QUIZORA Arena",
  emoji: "⚡",
  background: "linear-gradient(135deg,#09090b,#4c1d95,#0891b2)",
};


export const ARENA_THEMES: { id: ArenaTheme; label: string; emoji: string; background: string }[] = [
  { id: "neon", label: "QUIZORA Arena", emoji: "⚡", background: "linear-gradient(135deg,#09090b,#4c1d95,#0891b2)" },
  { id: "space", label: "Cosmic Space", emoji: "🚀", background: "linear-gradient(135deg,#020617,#312e81,#9333ea)" },
  { id: "jungle", label: "Wild Jungle", emoji: "🌴", background: "linear-gradient(135deg,#052e16,#15803d,#84cc16)" },
  { id: "candy", label: "Candy Pop", emoji: "🍭", background: "linear-gradient(135deg,#831843,#ec4899,#facc15)" },
  { id: "volcano", label: "Volcano", emoji: "🌋", background: "linear-gradient(135deg,#450a0a,#dc2626,#fb923c)" },
  { id: "cyber", label: "Cyber City", emoji: "🤖", background: "linear-gradient(135deg,#020617,#0e7490,#db2777)" },
  { id: "sunset", label: "Sunset Drive", emoji: "🌅", background: "linear-gradient(135deg,#431407,#ea580c,#f472b6)" },
  { id: "ocean", label: "Ocean Wave", emoji: "🌊", background: "linear-gradient(135deg,#082f49,#0284c7,#2dd4bf)" },
  { id: "arcade", label: "Retro Arcade", emoji: "🕹️", background: "linear-gradient(135deg,#111827,#7c3aed,#06b6d4)" },
  { id: "sky", label: "Sky High", emoji: "☁️", background: "linear-gradient(135deg,#1e3a8a,#38bdf8,#e0f2fe)" },
  { id: "lava", label: "Lava Rush", emoji: "🔥", background: "linear-gradient(135deg,#1c1917,#b91c1c,#f59e0b)" },
  { id: "forest", label: "Mystic Forest", emoji: "🌲", background: "linear-gradient(135deg,#022c22,#166534,#22c55e)" },
];

export function arenaTheme(id?: ArenaTheme) { return ARENA_THEMES.find((t) => t.id === id) ?? ARENA_THEMES[0]; }
export type QuestionDifficulty = "easy" | "medium" | "hard";
export const DIFFICULTY_MULTIPLIER: Record<QuestionDifficulty, number> = { easy: 1, medium: 1.5, hard: 2 };

export const QUESTION_THEMES = [
  ["toon-town","Toon Town","🎨","linear-gradient(135deg,#ff6b6b,#ffd93d,#6bcBef)"],["turbo-track","Turbo Track","🏎️","linear-gradient(135deg,#111827,#ef4444,#f59e0b)"],["anime-dojo","Anime Dojo","⚔️","linear-gradient(135deg,#312e81,#db2777,#f59e0b)"],["pixel-arcade","Pixel Arcade","🕹️","linear-gradient(135deg,#111827,#7c3aed,#06b6d4)"],["underwater","Deep Blue","🌊","linear-gradient(135deg,#082f49,#0891b2,#22d3ee)"],["space-race","Space Race","🚀","linear-gradient(135deg,#020617,#4338ca,#a855f7)"],["dino-park","Dino Park","🦖","linear-gradient(135deg,#14532d,#65a30d,#facc15)"],["candy-land","Candy Land","🍭","linear-gradient(135deg,#ec4899,#f472b6,#facc15)"],["volcano-run","Volcano Run","🌋","linear-gradient(135deg,#450a0a,#dc2626,#fb923c)"],["ninja-night","Ninja Night","🥷","linear-gradient(135deg,#020617,#1e1b4b,#7c3aed)"],["jungle-jump","Jungle Jump","🌴","linear-gradient(135deg,#064e3b,#16a34a,#84cc16)"],["robot-city","Robot City","🤖","linear-gradient(135deg,#0f172a,#0e7490,#22d3ee)"],["haunted","Haunted Hall","👻","linear-gradient(135deg,#171717,#581c87,#7c3aed)"],["pirate-bay","Pirate Bay","🏴‍☠️","linear-gradient(135deg,#172554,#0369a1,#eab308)"],["safari","Safari Quest","🦁","linear-gradient(135deg,#713f12,#ca8a04,#65a30d)"],["ice-cave","Ice Cave","🧊","linear-gradient(135deg,#082f49,#0ea5e9,#bae6fd)"],["desert","Desert Dash","🏜️","linear-gradient(135deg,#78350f,#f59e0b,#fde68a)"],["samurai","Samurai Arena","🗡️","linear-gradient(135deg,#1f2937,#991b1b,#fca5a5)"],["fairy","Fairy Grove","🧚","linear-gradient(135deg,#14532d,#a21caf,#f9a8d4)"],["cloud-nine","Cloud Nine","☁️","linear-gradient(135deg,#1e3a8a,#60a5fa,#e0f2fe)"],["music-fest","Music Fest","🎵","linear-gradient(135deg,#581c87,#c026d3,#fb7185)"],["football","Stadium Rush","🏟️","linear-gradient(135deg,#052e16,#16a34a,#facc15)"],["basketball","Hoop Zone","🏀","linear-gradient(135deg,#7c2d12,#ea580c,#fbbf24)"],["tennis","Tennis Pro","🎾","linear-gradient(135deg,#365314,#84cc16,#fef08a)"],["chess","Grand Chess","♟️","linear-gradient(135deg,#18181b,#52525b,#a1a1aa)"],["magic","Magic Realm","✨","linear-gradient(135deg,#312e81,#7e22ce,#f0abfc)"],["cyberpunk","Cyberpunk","🌃","linear-gradient(135deg,#020617,#db2777,#06b6d4)"],["neon-city","Neon City","🌆","linear-gradient(135deg,#172554,#2563eb,#ec4899)"],["comic","Comic Blast","💥","linear-gradient(135deg,#991b1b,#f97316,#fde047)"],["superhero","Hero HQ","🦸","linear-gradient(135deg,#1e3a8a,#dc2626,#facc15)"],["racing","Racing Pit","🏁","linear-gradient(135deg,#111827,#6b7280,#ef4444)"],["motorbike","Moto Rush","🏍️","linear-gradient(135deg,#18181b,#ea580c,#fbbf24)"],["retro","Retro Wave","📼","linear-gradient(135deg,#312e81,#c026d3,#22d3ee)"],["galaxy","Galaxy Quest","🌌","linear-gradient(135deg,#020617,#1d4ed8,#9333ea)"],["moon","Moon Base","🌙","linear-gradient(135deg,#111827,#334155,#94a3b8)"],["sun","Solar Flare","☀️","linear-gradient(135deg,#7c2d12,#f97316,#fde047)"],["rainbow","Rainbow Rush","🌈","linear-gradient(135deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)"],["forest","Mystic Forest","🌲","linear-gradient(135deg,#052e16,#166534,#22c55e)"],["ocean","Ocean Quest","🐠","linear-gradient(135deg,#082f49,#0369a1,#2dd4bf)"],["coral","Coral Reef","🪸","linear-gradient(135deg,#164e63,#f43f5e,#fb7185)"],["volley","Volley Arena","🏐","linear-gradient(135deg,#0c4a6e,#0284c7,#f8fafc)"],["boxing","Boxing Ring","🥊","linear-gradient(135deg,#450a0a,#b91c1c,#f59e0b)"],["skate","Skate Park","🛹","linear-gradient(135deg,#172554,#0ea5e9,#a3e635)"],["snowboard","Snow Ride","🏂","linear-gradient(135deg,#0c4a6e,#38bdf8,#f8fafc)"],["train","Express Run","🚄","linear-gradient(135deg,#111827,#2563eb,#94a3b8)"],["city","City Lights","🏙️","linear-gradient(135deg,#111827,#4f46e5,#ec4899)"],["castle","Castle Clash","🏰","linear-gradient(135deg,#1e1b4b,#7c3aed,#fbbf24)"],["wizard","Wizard School","🧙","linear-gradient(135deg,#172554,#6d28d9,#c084fc)"],["space-cowboy","Space Cowboy","🤠","linear-gradient(135deg,#451a03,#a16207,#38bdf8)"],["food","Food Frenzy","🍔","linear-gradient(135deg,#7c2d12,#ea580c,#facc15)"],["sushi","Sushi Bar","🍣","linear-gradient(135deg,#164e63,#0891b2,#fb7185)"],["coffee","Coffee Club","☕","linear-gradient(135deg,#292524,#92400e,#fbbf24)"],["lab","Mad Lab","🧪","linear-gradient(135deg,#052e16,#16a34a,#67e8f9)"],["space-monster","Monster Moon","👽","linear-gradient(135deg,#020617,#166534,#a3e635)"],["dragon","Dragon Realm","🐉","linear-gradient(135deg,#450a0a,#b91c1c,#f97316)"],["phoenix","Phoenix Fire","🔥","linear-gradient(135deg,#7f1d1d,#ea580c,#facc15)"],["storm","Thunder Storm","⛈️","linear-gradient(135deg,#172554,#475569,#38bdf8)"],["rain","Rain City","🌧️","linear-gradient(135deg,#0f172a,#334155,#60a5fa)"],["festival","Festival","🎉","linear-gradient(135deg,#be123c,#9333ea,#0ea5e9)"],["circus","Circus","🎪","linear-gradient(135deg,#991b1b,#eab308,#2563eb)"],["toy","Toy World","🧸","linear-gradient(135deg,#0f766e,#ec4899,#facc15)"],["final-boss","Final Boss","👹","linear-gradient(135deg,#18181b,#7f1d1d,#7c3aed)"]
] as const;
export type QuestionThemeId = typeof QUESTION_THEMES[number][0];
export function questionTheme(index: number, id?: string) { return QUESTION_THEMES.find((t) => t[0] === id) ?? QUESTION_THEMES[((index % QUESTION_THEMES.length) + QUESTION_THEMES.length) % QUESTION_THEMES.length]; }


export interface Game {
  id: string;
  quiz_id: string;
  host_id: string;
  pin: string;
  quiz_title: string;
  total_questions: number;
  status: GameStatus;
  current_index: number;
  question_started_at: string | null;
  theme?: ArenaTheme;
  max_players?: number;
  auto_next?: boolean;
  show_leaderboard?: boolean;
  show_answer_count?: boolean;
  sound_enabled?: boolean;
  speed_scoring?: boolean;
}

export interface Player {
  id: string;
  game_id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
}

export interface PlayerQuestion {
  index: number;
  options: string[];
  time_limit: number;
  correct_index: number | null;
  difficulty: QuestionDifficulty;
  theme_id: QuestionThemeId;
}

export interface Question {
  id: string;
  quiz_id: string;
  position: number;
  text: string;
  options: string[];
  correct_index: number;
  time_limit: number;
  points: number;
  difficulty: QuestionDifficulty;
  theme_id?: QuestionThemeId;
}

export interface PlayerSession {
  game_id: string;
  player_id: string;
  token: string;
}

const KEY = "quizora:player";

export function savePlayerSession(s: PlayerSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
export function loadPlayerSession(gameId: string): PlayerSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as PlayerSession;
    return s.game_id === gameId ? s : null;
  } catch {
    return null;
  }
}

export function secondsLeft(startedAt: string | null, limit: number, now: number): number {
  if (!startedAt) return limit;
  const elapsed = (now - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(limit - elapsed));
}

export function rankPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));
}
