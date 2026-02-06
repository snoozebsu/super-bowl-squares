import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return null;
  }

  return twilio(accountSid, authToken);
}

/** Normalize phone to E.164 (e.g. 5551234567 -> +15551234567) */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export async function sendVerification(phone: string): Promise<{ success: boolean; error?: string }> {
  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: "SMS verification not configured" };
  }

  try {
    const to = normalizePhone(phone);
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to, channel: "sms" });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send verification";
    return { success: false, error: message };
  }
}

export async function checkVerification(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: "SMS verification not configured" };
  }

  try {
    const to = normalizePhone(phone);
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to, code });
    return { success: verification.status === "approved" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid or expired code";
    return { success: false, error: message };
  }
}
