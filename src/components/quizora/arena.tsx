import { Link } from "@tanstack/react-router";
import { Zap, Star, Flame, Gem, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/quizora";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "font-display text-2xl tracking-wide",
        className
      )}
    >
      <span className="text-gradient-title">
        QUIZORA
      </span>
    </Link>
  );
}

/** Floating particles + drifting shapes behind every screen. */
export function ArenaBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 37) % 100,
        size: 3 + ((i * 7) % 6),
        dur: 12 + ((i * 5) % 14),
        delay: -((i * 3) % 20),
        tone: ["bg-primary", "bg-secondary", "bg-accent", "bg-ans-2"][i % 4],
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className={cn("absolute bottom-[-20px] rounded-full opacity-60 animate-drift", p.tone)}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export const ANSWER_STYLES: { icon: LucideIcon; bg: string; shadow: string; label: string }[] = [
  { icon: Zap, bg: "bg-ans-0", shadow: "shadow-[0_6px_0_0_var(--ans-0-deep)]", label: "Bolt" },
  { icon: Star, bg: "bg-ans-1", shadow: "shadow-[0_6px_0_0_var(--ans-1-deep)]", label: "Star" },
  { icon: Flame, bg: "bg-ans-2", shadow: "shadow-[0_6px_0_0_var(--ans-2-deep)]", label: "Flame" },
  { icon: Gem, bg: "bg-ans-3", shadow: "shadow-[0_6px_0_0_var(--ans-3-deep)]", label: "Gem" },
];

export function AnswerTile({
  index,
  text,
  onClick,
  disabled,
  state = "idle",
  count,
  big,
}: {
  index: number;
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  state?: "idle" | "correct" | "wrong" | "dim" | "picked";
  count?: number;
  big?: boolean;
}) {
  const s = ANSWER_STYLES[index]!;
  const Icon = s.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "press-3d relative flex w-full items-center gap-4 rounded-3xl px-5 text-left text-primary-foreground",
        big ? "min-h-28 py-6 text-2xl" : "min-h-20 py-4 text-lg",
        s.bg,
        s.shadow,
        state === "dim" && "opacity-30",
        state === "wrong" && "opacity-40 grayscale",
        state === "correct" && "ring-4 ring-foreground",
        state === "picked" && "ring-4 ring-foreground scale-[1.02]",
        disabled && "cursor-default",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background/20">
        <Icon className="size-7! fill-current" />
      </span>
      {text !== undefined && <span className="flex-1 font-semibold leading-tight">{text}</span>}
      {count !== undefined && (
        <span className="font-display rounded-xl bg-background/25 px-3 py-1 text-xl">{count}</span>
      )}
    </button>
  );
}

const CHARACTER_PALETTES = [
  { skin: "#ffd6b0", hair: "#263238", primary: "#ef476f", secondary: "#ffd166", accent: "#06d6a0" },
  { skin: "#f2b48f", hair: "#5b351f", primary: "#118ab2", secondary: "#90e0ef", accent: "#ffd166" },
  { skin: "#9b5f3f", hair: "#171717", primary: "#8338ec", secondary: "#ff006e", accent: "#3a86ff" },
  { skin: "#c9825b", hair: "#b45309", primary: "#06d6a0", secondary: "#ffd166", accent: "#ef476f" },
  { skin: "#6f3f2a", hair: "#1c1917", primary: "#3a86ff", secondary: "#f72585", accent: "#facc15" },
  { skin: "#e8a87c", hair: "#7c3aed", primary: "#fb5607", secondary: "#ffbe0b", accent: "#00b4d8" },
  { skin: "#f7c59f", hair: "#dc2626", primary: "#00b4d8", secondary: "#0077b6", accent: "#f72585" },
  { skin: "#8d5524", hair: "#111827", primary: "#f97316", secondary: "#84cc16", accent: "#22d3ee" },
];

const CHARACTER_STYLES = [
  "student", "racer", "ninja", "astronaut", "wizard", "pirate", "hero", "skater", "scientist", "gamer",
  "chef", "detective", "rockstar", "explorer", "royal",
] as const;

type CharacterStyle = (typeof CHARACTER_STYLES)[number];

function hashAvatar(id: string) {
  return [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function CharacterAccessory({ style, c }: { style: CharacterStyle; c: (typeof CHARACTER_PALETTES)[number] }) {
  if (style === "astronaut") return <><path d="M28 35Q50 20 72 35L68 48H32Z" fill="#e5e7eb" stroke="#111827" strokeWidth="2"/><rect x="34" y="35" width="32" height="11" rx="5" fill="#172033"/><circle cx="58" cy="40" r="2" fill="#67e8f9"/></>;
  if (style === "wizard") return <><path d="M23 29L50 3L77 29Z" fill={c.primary} stroke="#301060" strokeWidth="2"/><path d="M28 27Q50 20 72 27" fill="none" stroke={c.secondary} strokeWidth="4"/></>;
  if (style === "pirate") return <><path d="M19 28Q50 10 81 28L76 39H24Z" fill="#171717"/><path d="M39 27H67" stroke="#ef4444" strokeWidth="6"/><path d="M47 22v17" stroke="#fff" strokeWidth="2"/></>;
  if (style === "ninja") return <><path d="M22 42Q50 26 78 42L74 54Q50 44 26 54Z" fill="#111827"/><path d="M25 39H75" stroke="#ef4444" strokeWidth="3"/><circle cx="40" cy="42" r="2" fill="#fff"/><circle cx="60" cy="42" r="2" fill="#fff"/></>;
  if (style === "racer") return <><path d="M21 27Q50 9 79 27L73 41H27Z" fill="#ef4444"/><path d="M29 28H71" stroke="#fff" strokeWidth="5"/><path d="M50 18v15" stroke="#111827" strokeWidth="3"/></>;
  if (style === "hero") return <><path d="M25 23Q50 7 75 23L70 39H30Z" fill={c.primary}/><path d="M39 19h22" stroke="#ffd166" strokeWidth="4"/></>;
  if (style === "skater") return <><path d="M22 28Q50 12 78 28L72 40H28Z" fill={c.primary}/><path d="M30 27H70" stroke="#e5e7eb" strokeWidth="3"/></>;
  if (style === "chef") return <><path d="M26 30Q24 12 38 17Q50 4 62 17Q76 12 74 30Z" fill="#fff" stroke="#d1d5db" strokeWidth="2"/><path d="M30 30H70" stroke="#ef476f" strokeWidth="4"/></>;
  if (style === "detective") return <><path d="M20 30H80L73 40H27Z" fill="#8b5e34"/><path d="M35 29V22H65V29" fill="#a16207"/></>;
  if (style === "rockstar") return <><path d="M21 31Q50 4 79 31L72 42H28Z" fill="#111827"/><path d="M29 30L43 18L50 28L58 15L71 30" fill="none" stroke={c.accent} strokeWidth="3"/></>;
  if (style === "explorer") return <><path d="M22 30Q50 11 78 30L72 41H28Z" fill="#c08457"/><path d="M28 29H72" stroke="#fbbf24" strokeWidth="4"/></>;
  if (style === "royal") return <><path d="M23 28L31 12L41 21L50 9L59 21L69 12L77 28Z" fill="#facc15" stroke="#92400e" strokeWidth="2"/><circle cx="50" cy="16" r="3" fill="#ef4444"/></>;
  if (style === "scientist") return <><path d="M27 31Q28 14 39 16Q50 7 61 16Q72 14 73 31Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2"/><circle cx="39" cy="24" r="4" fill="none" stroke="#60a5fa" strokeWidth="2"/><circle cx="61" cy="24" r="4" fill="none" stroke="#60a5fa" strokeWidth="2"/></>;
  if (style === "gamer") return <><path d="M21 31Q25 10 50 13Q75 10 79 31L70 40H30Z" fill="#111827"/><path d="M31 26H69" stroke={c.accent} strokeWidth="4"/><circle cx="35" cy="25" r="2" fill={c.accent}/><circle cx="65" cy="25" r="2" fill={c.accent}/></>;
  return <><path d="M21 30Q50 10 79 30L72 41H28Z" fill={c.primary}/><path d="M31 28H69" stroke={c.secondary} strokeWidth="4"/></>;
}

export function CartoonAvatar({ avatar, size = "md" }: { avatar: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const n = hashAvatar(avatar);
  const c = CHARACTER_PALETTES[n % CHARACTER_PALETTES.length];
  const style = CHARACTER_STYLES[(n >> 4) % CHARACTER_STYLES.length];
  const expression = (n >> 7) % 3;
  const glasses = (n >> 9) % 4 === 0;
  const badge = (n >> 11) % 5 === 0;
  const sz = { sm: "h-14 w-12", md: "h-20 w-16", lg: "h-28 w-24", xl: "h-44 w-36" }[size];
  const avatarData = AVATARS.find((a) => a.id === avatar);
  const avatarName = avatarData?.name ?? "Player avatar";
  const imageSrc = "image" in (avatarData ?? {}) ? avatarData.image : undefined;
  const uid = `char-${avatar.replace(/[^a-z0-9]/gi, "")}`;

  if (imageSrc) {
    return (
      <span className={cn("relative inline-flex shrink-0 items-end justify-center", sz)}>
        <img
          src={imageSrc}
          alt={avatarName}
          className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,.28)]"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex shrink-0 items-end justify-center", sz)}>
      <svg viewBox="0 0 100 140" className="h-full w-full" role="img" aria-label={avatarName}>
        <defs>
          <linearGradient id={`${uid}-shirt`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c.primary}/><stop offset="1" stopColor={c.secondary}/></linearGradient>
          <linearGradient id={`${uid}-pants`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#334155"/><stop offset="1" stopColor="#111827"/></linearGradient>
          <filter id={`${uid}-shadow`}><feDropShadow dx="0" dy="2" stdDeviation="1.8" floodOpacity=".28"/></filter>
        </defs>

        {/* ground shadow */}
        <ellipse cx="50" cy="135" rx="27" ry="4" fill="#000" opacity=".22"/>

        {/* legs + shoes */}
        <path d="M35 101L47 101L45 126L31 126Z" fill={`url(#${uid}-pants)`} filter={`url(#${uid}-shadow)`}/>
        <path d="M53 101L65 101L69 126L55 126Z" fill={`url(#${uid}-pants)`} filter={`url(#${uid}-shadow)`}/>
        <path d="M28 123Q38 120 48 126L47 132H26Q24 128 28 123Z" fill="#f8fafc"/>
        <path d="M54 126Q64 120 73 124L77 132H53Z" fill="#f8fafc"/>

        {/* body */}
        <path d="M27 69Q50 61 73 69L68 105Q50 112 32 105Z" fill={`url(#${uid}-shirt)`} filter={`url(#${uid}-shadow)`}/>
        <path d="M31 75Q23 79 20 96L29 99L38 80Z" fill={c.primary}/>
        <path d="M69 75Q77 79 80 96L71 99L62 80Z" fill={c.primary}/>
        <circle cx="22" cy="96" r="5" fill={c.skin}/><circle cx="78" cy="96" r="5" fill={c.skin}/>

        {/* outfit details */}
        <path d="M42 70L50 81L58 70" fill={c.secondary} opacity=".9"/>
        {style === "hero" && <path d="M32 78L50 89L68 78V103H32Z" fill={c.primary} opacity=".65"/>}
        {style === "pirate" && <path d="M42 91L58 91L54 104H46Z" fill="#facc15"/>}
        {style === "scientist" && <path d="M43 74V104M57 74V104" stroke="#fff" strokeWidth="2" opacity=".75"/>}
        {style === "gamer" && <><rect x="39" y="87" width="22" height="12" rx="3" fill="#111827"/><path d="M45 93h10" stroke={c.accent} strokeWidth="2"/></>}
        {style === "racer" && <path d="M29 83L70 100" stroke="#fff" strokeWidth="4" opacity=".9"/>}

        {/* neck */}
        <path d="M43 64H57V74H43Z" fill={c.skin}/>

        {/* head */}
        <ellipse cx="50" cy="46" rx="25" ry="27" fill={c.skin} filter={`url(#${uid}-shadow)`}/>

        {/* ears */}
        <circle cx="25" cy="48" r="5" fill={c.skin}/><circle cx="75" cy="48" r="5" fill={c.skin}/>

        {/* hair */}
        <path d="M25 44Q22 16 49 14Q77 14 75 45L67 34Q57 39 50 27Q42 39 31 35Z" fill={c.hair}/>
        {style === "rockstar" && <path d="M27 31L35 12L43 29L55 9L61 29L74 16L72 42H28Z" fill={c.hair}/>} 
        {style === "royal" && <path d="M30 30L36 12L50 22L64 12L70 30Z" fill={c.hair}/>} 

        {/* eyes */}
        {glasses ? <>
          <rect x="27" y="42" width="20" height="12" rx="5" fill="#e2e8f0" fillOpacity=".32" stroke="#172033" strokeWidth="3"/>
          <rect x="53" y="42" width="20" height="12" rx="5" fill="#e2e8f0" fillOpacity=".32" stroke="#172033" strokeWidth="3"/>
          <path d="M47 47H53" stroke="#172033" strokeWidth="3"/>
          <circle cx="40" cy="48" r="3" fill="#111827"/><circle cx="60" cy="48" r="3" fill="#111827"/>
        </> : <><ellipse cx="40" cy="48" rx="4" ry="5" fill="#111827"/><ellipse cx="60" cy="48" rx="4" ry="5" fill="#111827"/><circle cx="39" cy="47" r="1.2" fill="#fff"/><circle cx="59" cy="47" r="1.2" fill="#fff"/></>}

        {/* face */}
        {expression === 0 && <path d="M42 61Q50 68 58 61" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round"/>}
        {expression === 1 && <path d="M42 63Q50 60 58 63" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round"/>}
        {expression === 2 && <ellipse cx="50" cy="63" rx="5" ry="4" fill="#7c2d12"/>}
        <circle cx="31" cy="59" r="4" fill="#fb7185" opacity=".35"/><circle cx="69" cy="59" r="4" fill="#fb7185" opacity=".35"/>

        {/* style-specific accessory */}
        <CharacterAccessory style={style} c={c} />

        {badge && <><circle cx="83" cy="105" r="8" fill={c.accent} stroke="#fff" strokeWidth="2"/><path d="M79 105l3 3l5-7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>}
      </svg>
    </span>
  );
}

export function AvatarBubble({ avatar, size = "md" }: { avatar: string; size?: "sm" | "md" | "lg" | "xl" }) {
  return <CartoonAvatar avatar={avatar} size={size} />;
}

export function TimerRing({ left, total }: { left: number; total: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? left / total : 0;
  const danger = left <= 5;
  return (
    <div className="relative size-28">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} className="fill-none stroke-muted" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className={cn("fill-none transition-all duration-1000 ease-linear", danger ? "stroke-accent" : "stroke-primary")}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <span className={cn("font-display absolute inset-0 flex items-center justify-center text-4xl", danger && "text-accent")}>
        {left}
      </span>
    </div>
  );
}

export function HudPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", className)}>
      {children}
    </div>
  );
}
