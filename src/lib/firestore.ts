import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { ensureAnonymousUser } from "@/lib/firebase";
import { DIFFICULTY_MULTIPLIER, questionTheme, type Game, type Player, type Question, type ArenaTheme, type GameStatus, type PlayerQuestion, type QuestionDifficulty } from "@/lib/quizora";

const quizzesRef = collection(firebaseDb, "quizzes");

function clean<T extends DocumentData>(value: T): T {
  return value;
}

function gameFrom(id: string, data: DocumentData): Game {
  return { id, ...data } as Game;
}

function playerFrom(id: string, data: DocumentData): Player {
  return { id, ...data } as Player;
}

function questionFrom(id: string, data: DocumentData): Question {
  return { id, difficulty: "medium", ...data } as Question;
}

export async function listMyQuizzes(ownerId: string) {
  const snap = await getDocs(query(quizzesRef, where("ownerId", "==", ownerId)));
  const result = [];
  for (const item of snap.docs) {
    const questions = await getDocs(query(collection(item.ref, "questions"), orderBy("position", "asc")));
    result.push({ id: item.id, ...item.data(), questionCount: questions.size });
  }
  return result.sort((a, b) => {
    const ta = (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
    const tb = (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
    return tb - ta;
  }) as Array<{ id: string; title: string; description?: string; createdAt?: unknown; questionCount: number }>;
}

export async function createQuiz(ownerId: string, title: string, sampleQuestions?: Array<Pick<Question, "text" | "options" | "correct_index" | "time_limit" | "points"> & Partial<Pick<Question, "difficulty" | "theme_id">>>) {
  const quiz = await addDoc(quizzesRef, {
    ownerId,
    title,
    description: "",
    createdAt: serverTimestamp(),
  });
  if (sampleQuestions?.length) {
    await Promise.all(sampleQuestions.map((q, position) => addDoc(collection(quiz, "questions"), {
      text: q.text,
      options: q.options,
      correct_index: q.correct_index,
      time_limit: q.time_limit,
      points: q.points,
      difficulty: q.difficulty ?? "medium",
      theme_id: q.theme_id ?? questionTheme(position)[0],
      position,
    })));
  }
  return quiz.id;
}

export async function deleteQuiz(ownerId: string, quizId: string) {
  const ref = doc(firebaseDb, "quizzes", quizId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().ownerId !== ownerId) throw new Error("You do not own this quiz.");
  const questions = await getDocs(collection(ref, "questions"));
  await Promise.all(questions.docs.map((q) => deleteDoc(q.ref)));
  await deleteDoc(ref);
}

export async function getQuiz(ownerId: string, quizId: string) {
  const ref = doc(firebaseDb, "quizzes", quizId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().ownerId !== ownerId) throw new Error("Quiz not found.");
  const qs = await getDocs(query(collection(ref, "questions"), orderBy("position", "asc")));
  return { id: quizId, ...snap.data(), questions: qs.docs.map((q) => questionFrom(q.id, { ...q.data(), quiz_id: quizId })) };
}

export async function saveQuiz(ownerId: string, quizId: string, title: string, questions: Array<Partial<Question> & Pick<Question, "text" | "options" | "correct_index" | "time_limit" | "points">>) {
  const ref = doc(firebaseDb, "quizzes", quizId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().ownerId !== ownerId) throw new Error("Quiz not found.");
  await updateDoc(ref, { title: title.trim() || "Untitled quiz" });
  const old = await getDocs(collection(ref, "questions"));
  const keep = new Set(questions.map((q) => q.id).filter(Boolean));
  await Promise.all(old.docs.filter((q) => !keep.has(q.id)).map((q) => deleteDoc(q.ref)));
  await Promise.all(questions.map((q, position) => {
    const data = { text: q.text, options: q.options, correct_index: q.correct_index, time_limit: q.time_limit, points: q.points, difficulty: q.difficulty ?? "medium", theme_id: q.theme_id ?? questionTheme(position)[0], position };
    return q.id ? setDoc(doc(ref, "questions", q.id), data, { merge: true }) : addDoc(collection(ref, "questions"), data);
  }));
  return getQuiz(ownerId, quizId);
}

async function uniquePin() {
  for (let i = 0; i < 20; i++) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await getDocs(query(collection(firebaseDb, "games"), where("pin", "==", pin), limit(1)));
    if (existing.empty) return pin;
  }
  throw new Error("Could not create a unique game PIN. Try again.");
}

export async function createGame(ownerId: string, quizId: string) {
  const quiz = await getQuiz(ownerId, quizId);
  if (!quiz.questions.length) throw new Error("Add at least one question before starting a game.");
  const pin = await uniquePin();
  const ref = doc(collection(firebaseDb, "games"));
  const game: Omit<Game, "id"> = {
    quiz_id: quizId,
    host_id: ownerId,
    pin,
    quiz_title: String(quiz.title ?? "QUIZORA Game"),
    total_questions: quiz.questions.length,
    status: "lobby",
    current_index: -1,
    question_started_at: null,
    theme: "neon",
    max_players: 100,
    auto_next: false,
    show_leaderboard: true,
    show_answer_count: true,
    sound_enabled: true,
    speed_scoring: true,
  };
  await setDoc(ref, { ...game, createdAt: serverTimestamp() });
  await Promise.all(quiz.questions.map((q, position) => setDoc(doc(ref, "questions", String(position)), {
    position, text: q.text, options: q.options, time_limit: q.time_limit, difficulty: q.difficulty ?? "medium", theme_id: q.theme_id ?? questionTheme(position)[0],
  })));
  return ref.id;
}

export async function getGame(gameId: string) {
  const snap = await getDoc(doc(firebaseDb, "games", gameId));
  return snap.exists() ? gameFrom(snap.id, snap.data()) : null;
}

export function subscribeGame(gameId: string, onGame: (game: Game | null) => void, onPlayers: (players: Player[]) => void): Unsubscribe {
  const gameUnsub = onSnapshot(doc(firebaseDb, "games", gameId), (snap) => onGame(snap.exists() ? gameFrom(snap.id, snap.data()) : null));
  const playersUnsub = onSnapshot(query(collection(firebaseDb, "games", gameId, "players"), orderBy("joinedAt", "asc")), (snap) => {
    onPlayers(snap.docs.map((p) => playerFrom(p.id, p.data())));
  });
  return () => { gameUnsub(); playersUnsub(); };
}

export async function getQuestions(game: Game) {
  const snap = await getDocs(query(collection(firebaseDb, "quizzes", game.quiz_id, "questions"), orderBy("position", "asc")));
  return snap.docs.map((q) => questionFrom(q.id, { ...q.data(), quiz_id: game.quiz_id }));
}

export async function setGameState(ownerId: string, gameId: string, status: GameStatus, index: number) {
  const ref = doc(firebaseDb, "games", gameId);
  await runTransaction(firebaseDb, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists() || snap.data().host_id !== ownerId) throw new Error("You are not the host of this game.");
    const patch: DocumentData = { status, current_index: index };
    if (status === "question") patch.question_started_at = new Date().toISOString();
    if (status === "lobby") patch.question_started_at = null;
    tx.update(ref, patch);
  });
}

export async function updateGameSettings(ownerId: string, gameId: string, settings: { theme: ArenaTheme; max_players: number; auto_next: boolean; show_leaderboard: boolean; show_answer_count: boolean; sound_enabled: boolean; speed_scoring: boolean }) {
  const ref = doc(firebaseDb, "games", gameId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().host_id !== ownerId) throw new Error("You are not the host.");
  await updateDoc(ref, settings);
}

export async function kickPlayer(ownerId: string, gameId: string, playerId: string) {
  const game = await getGame(gameId);
  if (!game || game.host_id !== ownerId) throw new Error("You are not the host.");
  await deleteDoc(doc(firebaseDb, "games", gameId, "players", playerId));
}

export async function getAnswerCounts(gameId: string, questionIndex: number) {
  const snap = await getDocs(query(collection(firebaseDb, "games", gameId, "answers"), where("questionIndex", "==", questionIndex)));
  const counts = [0, 0, 0, 0];
  snap.forEach((d) => { const c = Number(d.data().choice); if (c >= 0 && c < 4) counts[c]++; });
  return { counts, answered: snap.size };
}

export function subscribeAnswerCounts(gameId: string, questionIndex: number, onChange: (counts: number[], answered: number) => void) {
  return onSnapshot(query(collection(firebaseDb, "games", gameId, "answers"), where("questionIndex", "==", questionIndex)), (snap) => {
    const counts = [0, 0, 0, 0];
    snap.forEach((d) => { const c = Number(d.data().choice); if (c >= 0 && c < 4) counts[c]++; });
    onChange(counts, snap.size);
  });
}

export async function joinGame(pin: string, nickname: string, avatar: string): Promise<PlayerSession> {
  const user = await ensureAnonymousUser();
  const snap = await getDocs(query(collection(firebaseDb, "games"), where("pin", "==", pin), limit(1)));
  if (snap.empty) throw new Error("Game not found. Check the PIN.");
  const gameRef = snap.docs[0].ref;
  const game = snap.docs[0].data() as Game;
  if (game.status !== "lobby") throw new Error("This game has already started.");
  const playersSnap = await getDocs(collection(gameRef, "players"));
  if (playersSnap.size >= (game.max_players ?? 100)) throw new Error("This arena is full.");
  if (playersSnap.docs.some((p) => String(p.data().nickname).toLowerCase() === nickname.trim().toLowerCase())) throw new Error("That nickname is already taken.");
  const playerRef = doc(gameRef, "players", user.uid);
  await setDoc(playerRef, { nickname: nickname.trim(), avatar, score: 0, streak: 0, joinedAt: serverTimestamp() });
  return { game_id: snap.docs[0].id, player_id: user.uid, token: user.uid };
}

export async function getPlayerQuestion(
  gameId: string,
  index: number,
): Promise<PlayerQuestion | null> {
  const game = await getGame(gameId);

  if (!game) {
    return null;
  }

  const gameQuestionRef = doc(
    firebaseDb,
    "games",
    gameId,
    "questions",
    String(index),
  );

  const snap = await getDoc(gameQuestionRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();

  const options = Array.isArray(data.options)
    ? data.options.map(String)
    : [];

  if (options.length !== 4) {
    throw new Error(
      `Question ${index + 1} must have exactly 4 options.`,
    );
  }

  const timeLimit = Number(data.time_limit);

  const difficulty =
    (data.difficulty ?? "medium") as QuestionDifficulty;

  const theme_id = questionTheme(
    index,
    data.theme_id,
  )[0];

  /*
   * The correct answer is intentionally hidden
   * while the question is active.
   */
  let correct_index: number | null = null;

  /*
   * During reveal/leaderboard we can safely expose
   * the correct answer.
   *
   * IMPORTANT:
   * Search the quiz questions by `position`
   * instead of assuming the Firestore document ID
   * is "0", "1", "2", etc.
   */
  if (
    game.status === "reveal" ||
    game.status === "leaderboard" ||
    game.status === "finished"
  ) {
    const quizQuestions = await getDocs(
      query(
        collection(
          firebaseDb,
          "quizzes",
          game.quiz_id,
          "questions",
        ),
        where("position", "==", index),
        limit(1),
      ),
    );

    if (!quizQuestions.empty) {
      const originalQuestion =
        quizQuestions.docs[0].data();

      correct_index = Number(
        originalQuestion.correct_index,
      );
    }
  }

  return {
    index,
    options,
    time_limit:
      Number.isFinite(timeLimit) && timeLimit > 0
        ? timeLimit
        : 20,
    correct_index,
    difficulty,
    theme_id,
  };
}

export async function getMyAnswer(gameId: string, playerId: string, index: number): Promise<{ choice: number; correct: boolean; points: number } | null> {
  const snap = await getDoc(doc(firebaseDb, "games", gameId, "answers", `${playerId}_${index}`));
  return snap.exists() ? snap.data() as { choice: number; correct: boolean; points: number } : null;
}

export async function submitAnswer(gameId: string, playerId: string, index: number, choice: number) {
  const gameRef = doc(firebaseDb, "games", gameId);
  const answerRef = doc(firebaseDb, "games", gameId, "answers", `${playerId}_${index}`);
  const playerRef = doc(firebaseDb, "games", gameId, "players", playerId);
  const gameSnap = await getDoc(gameRef);
  if (!gameSnap.exists()) throw new Error("Game not found.");
  const game = gameSnap.data() as Game;
  if (game.status !== "question" || game.current_index !== index) throw new Error("This question is no longer accepting answers.");
  const qSnap = await getDoc(doc(firebaseDb, "quizzes", game.quiz_id, "questions", String(index)));
  let q = qSnap.exists() ? qSnap.data() : null;
  if (!q) {
    const fallback = await getDocs(query(collection(firebaseDb, "quizzes", game.quiz_id, "questions"), where("position", "==", index), limit(1)));
    q = fallback.empty ? null : fallback.docs[0].data();
  }
  if (!q) throw new Error("Question not found.");
  const elapsed = game.question_started_at ? (Date.now() - new Date(game.question_started_at).getTime()) / 1000 : Number(q.time_limit);
  if (elapsed > Number(q.time_limit)) throw new Error("Time is up.");
  const correct = Number(q.correct_index) === choice;
  const difficulty = (q.difficulty ?? "medium") as QuestionDifficulty;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty] ?? 1.5;
  const base = correct ? Math.round(Number(q.points ?? 1000) * multiplier) : 0;
  // Correct answers earn more when they arrive early. At the deadline a correct answer
  // receives 50% of its difficulty-adjusted base; the fastest answer receives 100%.
  const speedRatio = Math.max(0, Math.min(1, 1 - elapsed / Number(q.time_limit)));
  const speedFactor = game.speed_scoring && correct ? 0.5 + speedRatio * 0.5 : 1;
  const points = correct ? Math.max(0, Math.round(base * speedFactor)) : 0;
  await runTransaction(firebaseDb, async (tx) => {
    const [playerSnap, answerSnap] = await Promise.all([tx.get(playerRef), tx.get(answerRef)]);
    if (!playerSnap.exists()) throw new Error("Player session is no longer active.");
    if (answerSnap.exists()) throw new Error("Answer already submitted.");
    const previous = playerSnap.data();
    const streak = correct ? Number(previous.streak ?? 0) + 1 : 0;
    tx.set(answerRef, { playerId, questionIndex: index, choice, correct, points, basePoints: base, speedFactor, difficulty, elapsedSeconds: Math.max(0, elapsed), submittedAt: serverTimestamp() });
    tx.update(playerRef, { score: Number(previous.score ?? 0) + points, streak });
  });
}

export async function updatePlayerProfile(gameId: string, playerId: string, nickname: string, avatar: string) {
  const players = await getDocs(collection(firebaseDb, "games", gameId, "players"));
  if (players.docs.some((p) => p.id !== playerId && String(p.data().nickname).toLowerCase() === nickname.trim().toLowerCase())) throw new Error("That nickname is already taken.");
  await updateDoc(doc(firebaseDb, "games", gameId, "players", playerId), { nickname: nickname.trim(), avatar });
}
