import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTakenSquaresCount } from "@/lib/game";
import { checkVerification, normalizePhone } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { name, squaresToBuy, phone, otpCode, email } = body;

    if (!name || squaresToBuy == null) {
      return NextResponse.json(
        { error: "Name and squaresToBuy are required" },
        { status: 400 }
      );
    }

    // If phone provided, OTP must be verified first
    let normalizedPhone: string | null = null;
    if (phone) {
      if (!otpCode) {
        return NextResponse.json(
          { error: "Verification code required when using phone" },
          { status: 400 }
        );
      }
      const verifyResult = await checkVerification(phone, String(otpCode));
      if (!verifyResult.success) {
        return NextResponse.json(
          { error: verifyResult.error || "Invalid or expired code" },
          { status: 400 }
        );
      }
      normalizedPhone = normalizePhone(phone);
    }

    const normalizedEmail = email && String(email).trim().includes("@")
      ? String(email).trim().toLowerCase()
      : null;

    const quantity = parseInt(String(squaresToBuy), 10);
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: "Must buy between 1 and 100 squares" },
        { status: 400 }
      );
    }

    const db = getDb();
    const game = db
      .prepare("SELECT * FROM games WHERE code = ?")
      .get(code.toUpperCase()) as {
      id: number;
      status: string;
      numbers_assigned: number;
    } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "pending") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    const takenCount = getTakenSquaresCount(game.id);
    const available = 100 - takenCount;
    if (quantity > available) {
      return NextResponse.json(
        { error: `Only ${available} squares available` },
        { status: 400 }
      );
    }

    const insertUser = db.prepare(`
      INSERT INTO users (name, game_id, is_admin, squares_to_buy, phone, email)
      VALUES (?, ?, 0, ?, ?, ?)
    `);
    const result = insertUser.run(String(name), game.id, quantity, normalizedPhone, normalizedEmail);
    const userId = (result as { lastInsertRowid: number }).lastInsertRowid;

    return NextResponse.json({
      userId,
      gameId: game.id,
      message: "Joined game successfully",
    });
  } catch (error) {
    console.error("Join game error:", error);
    return NextResponse.json(
      { error: "Failed to join game" },
      { status: 500 }
    );
  }
}
