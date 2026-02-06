import { NextRequest, NextResponse } from "next/server";
import { sendVerification } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const result = await sendVerification(phone);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send code" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send verification" }, { status: 500 });
  }
}
