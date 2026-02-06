import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkVerification, normalizePhone } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { phone, otpCode } = body;

    if (!phone || !otpCode) {
      return NextResponse.json(
        { error: "Phone and verification code are required" },
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

    const db = getDb();
    const normalizedPhone = normalizePhone(phone);
    const game = db
      .prepare("SELECT id FROM games WHERE code = ?")
      .get(code.toUpperCase()) as { id: number } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const user = db
      .prepare(
        "SELECT id, name, is_admin, squares_to_buy FROM users WHERE game_id = ? AND phone = ?"
      )
      .get(game.id, normalizedPhone) as
      | { id: number; name: string; is_admin: number; squares_to_buy: number }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "No account found for this phone number in this game" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      gameId: game.id,
      isAdmin: user.is_admin === 1,
      name: user.name,
      squaresToBuy: user.squares_to_buy,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
