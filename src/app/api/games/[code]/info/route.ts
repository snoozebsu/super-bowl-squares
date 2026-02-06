import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTakenSquaresCount } from "@/lib/game";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const db = getDb();

    const game = db
      .prepare(
        "SELECT * FROM games WHERE code = ?"
      )
      .get(code.toUpperCase()) as {
      id: number;
      code: string;
      name: string;
      price_per_square: number;
      payout_q1: number;
      payout_q2: number;
      payout_q3: number;
      payout_final: number;
      status: string;
      admin_id: number | null;
      numbers_assigned: number;
      row_numbers: string | null;
      col_numbers: string | null;
      created_at: string;
    } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const takenCount = getTakenSquaresCount(game.id);

    const users = db
      .prepare(
        "SELECT id, name, is_admin, squares_to_buy FROM users WHERE game_id = ?"
      )
      .all(game.id) as Array<{
      id: number;
      name: string;
      is_admin: number;
      squares_to_buy: number;
    }>;

    const userSelections = db
      .prepare(
        `SELECT user_id, COUNT(*) as count FROM squares WHERE game_id = ? AND user_id IS NOT NULL GROUP BY user_id`
      )
      .all(game.id) as Array<{ user_id: number; count: number }>;

    const selectionMap = Object.fromEntries(
      userSelections.map((s) => [s.user_id, s.count])
    );

    return NextResponse.json({
      ...game,
      takenSquares: takenCount,
      availableSquares: 100 - takenCount,
      users: users.map((u) => ({
        ...u,
        selectedCount: selectionMap[u.id] ?? 0,
      })),
    });
  } catch (error) {
    console.error("Get game info error:", error);
    return NextResponse.json(
      { error: "Failed to get game info" },
      { status: 500 }
    );
  }
}
