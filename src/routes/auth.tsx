import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  firebaseAuth,
  googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/quizora/arena";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Host sign in — QUIZORA" },
      { name: "description", content: "Sign in to create quizzes and host live games on QUIZORA." },
    ],
  }),
  component: AuthPage,
});

function friendlyAuthError(message: string) {
  if (message.includes("auth/invalid-credential")) return "Email or password is incorrect.";
  if (message.includes("auth/email-already-in-use")) return "An account already exists with this email.";
  if (message.includes("auth/weak-password")) return "Use a stronger password (at least 6 characters).";
  if (message.includes("auth/popup-closed-by-user")) return "Google sign-in was cancelled.";
  if (message.includes("auth/popup-blocked")) return "Your browser blocked the Google sign-in popup.";
  return message.replace("Firebase: ", "").replace(/\s*\(auth\/[^)]+\)\.?$/, "");
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) void navigate({ to: "/dashboard" });
    });
    return unsubscribe;
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        toast.success("Welcome back to the arena!");
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        toast.success("Host account created — welcome to QUIZORA!");
      }
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(friendlyAuthError(error instanceof Error ? error.message : String(error)));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
      toast.success("Signed in with Google!");
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(friendlyAuthError(error instanceof Error ? error.message : String(error)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-5">
      <Logo className="text-4xl" />
      <div className="glass w-full max-w-sm rounded-4xl p-7">
        <h1 className="mb-1 text-3xl">{mode === "in" ? "Welcome back, host" : "Become a host"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">Players never need an account — only hosts do.</p>
        <Button variant="glass" className="mb-4 h-12 w-full" onClick={() => void google()} disabled={busy}>
          Continue with Google
        </Button>
        <div className="mb-4 text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" />
          <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" autoComplete={mode === "in" ? "current-password" : "new-password"} />
          <Button type="submit" variant="arena" size="lg" disabled={busy}>
            {busy ? "Connecting…" : mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm text-secondary hover:underline">
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
