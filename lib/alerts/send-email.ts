export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "alerts@gulffinancejobs.com";

  if (!apiKey) {
    // Dev/staging: log instead of sending
    console.log(
      `[send-email] No RESEND_API_KEY — would have sent to ${payload.to}: "${payload.subject}"`
    );
    return { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `Resend ${res.status}: ${body}` };
  }

  return { ok: true };
}
