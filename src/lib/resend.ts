import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendMagicLinkEmail(
  to: string,
  token: string,
  gameCode: string
): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: "Email not configured" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";
  const verifyUrl = `${appUrl.replace(/\/$/, "")}/auth/verify?token=${token}`;

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const { error } = await client.emails.send({
      from,
      to,
      subject: "Log in to your Super Bowl Squares game",
      html: `
        <p>Click the link below to log back in to your game:</p>
        <p><a href="${verifyUrl}" style="color: #69BE28; font-weight: bold;">Log in to game ${gameCode}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: message };
  }
}
