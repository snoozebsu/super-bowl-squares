import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { assignNumbers } from "@/lib/game";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const game = db
      .prepare("SELECT id, status, admin_id FROM games WHERE code = ?")
      .get(code.toUpperCase()) as {
      id: number;
      status: string;
      admin_id: number | null;
    } | undefined;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.admin_id !== adminId) {
      return NextResponse.json(
        { error: "Only admin can start the game" },
        { status: 403 }
      );
    }

    if (game.status !== "pending") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    const { rows, cols } = assignNumbers();

    db.prepare(
      "UPDATE games SET status = 'started', numbers_assigned = 1, row_numbers = ?, col_numbers = ? WHERE id = ?"
    ).run(JSON.stringify(rows), JSON.stringify(cols), game.id);

    try {
      const { getSocketServer } = await import("@/lib/socket-server-node");
      const io = getSocketServer();
      if (io) {
        io.to(code.toUpperCase()).emit("game-started", { rowNumbers: rows, colNumbers: cols });
      }
    } catch {
      // Socket server may not be available
    }

    return NextResponse.json({
      success: true,
      rowNumbers: rows,
      colNumbers: cols,
      message: "Game started",
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
