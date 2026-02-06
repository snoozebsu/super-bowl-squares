import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const game = db
      .prepare("SELECT id, status FROM games WHERE code = ?")
      .get(code.toUpperCase()) as { id: number; status: string } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "pending") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT id, squares_to_buy, picks_submitted FROM users WHERE id = ? AND game_id = ?")
      .get(userId, game.id) as { id: number; squares_to_buy: number; picks_submitted?: number } | undefined;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.picks_submitted) {
      return NextResponse.json(
        { error: "Picks already submitted" },
        { status: 400 }
      );
    }

    const selectedCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM squares WHERE game_id = ? AND user_id = ?"
      )
      .get(game.id, userId) as { count: number };

    if (selectedCount.count !== user.squares_to_buy) {
      return NextResponse.json(
        { error: `Select all ${user.squares_to_buy} squares before submitting` },
        { status: 400 }
      );
    }

    db.prepare(
      "UPDATE users SET picks_submitted = 1 WHERE id = ? AND game_id = ?"
    ).run(userId, game.id);

    try {
      const { getSocketServer } = await import("@/lib/socket-server-node");
      const io = getSocketServer();
      if (io) {
        io.to(code.toUpperCase()).emit("picks-submitted", { userId });
      }
    } catch {
      // Socket server may not be available
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit picks error:", error);
    return NextResponse.json(
      { error: "Failed to submit picks" },
      { status: 500 }
    );
  }
}
