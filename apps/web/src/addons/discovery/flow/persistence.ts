import { Stage, AestheticScores, UserSignals } from "@/types/discovery";
import { initialScores } from "../core/scoring";
import { initialSignals } from "./session";

const QUIZ_SESSION_KEY = "ca_quiz_session";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface PersistedSession {
  stage: Stage;
  mode: "quick" | "deep";
  scores: AestheticScores;
  signals: UserSignals;
  sessionId: string | null;
  savedAt: number;
}

export function saveSession(data: Omit<PersistedSession, "savedAt">): void {
  try {
    localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch (e) { console.warn("Failed to save session", e); }
}

export function loadSession(): Omit<PersistedSession, "savedAt"> | null {
  try {
    const raw = localStorage.getItem(QUIZ_SESSION_KEY);
    if (!raw) return null;
    const parsed: PersistedSession = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > TTL_MS) {
      clearSession();
      return null;
    }
    if (parsed.stage <= Stage.Welcome || parsed.stage >= Stage.Results) {
      clearSession();
      return null;
    }
    return { stage: parsed.stage, mode: parsed.mode, scores: parsed.scores, signals: parsed.signals, sessionId: parsed.sessionId };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try { localStorage.removeItem(QUIZ_SESSION_KEY); } catch (e) { console.warn("Failed to clear session", e); }
}
