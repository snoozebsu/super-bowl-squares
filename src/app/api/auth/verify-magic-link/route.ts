import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const row = db
      .prepare(
        `SELECT mt.email, mt.game_id, g.code 
         FROM magic_tokens mt 
         JOIN games g ON g.id = mt.game_id 
         WHERE mt.token = ? AND mt.expires_at > datetime('now')`
      )
      .get(token) as
      | { email: string; game_id: number; code: string }
      | undefined;

    if (!row) {
      return NextResponse.json(
        { error: "Invalid or expired link. Request a new one." },
        { status: 400 }
      );
    }

    const user = db
      .prepare(
        "SELECT id, name, is_admin, squares_to_buy FROM users WHERE game_id = ? AND email = ?"
      )
      .get(row.game_id, row.email) as
      | { id: number; name: string; is_admin: number; squares_to_buy: number }
      | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM magic_tokens WHERE token = ?").run(token);

    return NextResponse.json({
      userId: user.id,
      gameId: row.game_id,
      gameCode: row.code,
      isAdmin: user.is_admin === 1,
      name: user.name,
      squaresToBuy: user.squares_to_buy,
    });
  } catch (error) {
    console.error("Verify magic link error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
