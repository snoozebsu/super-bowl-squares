import { NextRequest, NextResponse } from "next/server";
import { checkVerification } from "@/lib/twilio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
    }

    const result = await checkVerification(phone, String(code));

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Invalid code" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
