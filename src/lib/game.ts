import { getDb } from "./db";
import type { Game } from "./db";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateGameCode(): string {
  const db = getDb();
  let code: string;
  let exists: { count: number } | undefined;

  do {
    code = "";
    for (let i = 0; i < 6; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    exists = db.prepare("SELECT COUNT(*) as count FROM games WHERE code = ?").get(code) as { count: number } | undefined;
  } while (exists && exists.count > 0);

  return code;
}

export function assignNumbers(): { rows: number[]; cols: number[] } {
  const shuffle = (arr: number[]) => {
    let copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  return {
    rows: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
    cols: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  };
}

export function getAvailableSquaresCount(gameId: number): number {
  const db = getDb();
  const result = db
    .prepare("SELECT COUNT(*) as count FROM squares WHERE game_id = ? AND user_id IS NULL")
    .get(gameId) as { count: number };
  return result?.count ?? 0;
}

export function getTakenSquaresCount(gameId: number): number {
  const db = getDb();
  const result = db
    .prepare("SELECT COUNT(*) as count FROM squares WHERE game_id = ? AND user_id IS NOT NULL")
    .get(gameId) as { count: number };
  return result?.count ?? 0;
}
