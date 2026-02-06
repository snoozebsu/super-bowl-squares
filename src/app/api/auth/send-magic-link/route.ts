import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/resend";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

const TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, gameCode } = body;

    if (!email || !gameCode) {
      return NextResponse.json(
        { error: "Email and game code are required" },
        { status: 400 }
      );
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    if (!emailTrimmed.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const db = getDb();
    const game = db
      .prepare("SELECT id, code FROM games WHERE code = ?")
      .get(gameCode.toUpperCase()) as { id: number; code: string } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const user = db
      .prepare("SELECT id FROM users WHERE game_id = ? AND email = ?")
      .get(game.id, emailTrimmed) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email in this game" },
        { status: 404 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    db.prepare(
      "INSERT INTO magic_tokens (token, email, game_id, expires_at) VALUES (?, ?, ?, ?)"
    ).run(token, emailTrimmed, game.id, expiresAt);

    const result = await sendMagicLinkEmail(emailTrimmed, token, game.code);

    if (!result.success) {
      db.prepare("DELETE FROM magic_tokens WHERE token = ?").run(token);
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for a link to log in",
    });
  } catch (error) {
    console.error("Send magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
