
/**
 * RESEND EMAIL DELIVERY SERVICE
 */

const RESEND_API_KEY = "re_6bMTY4H6_4rktATZTwLpPJzk5dxwvndNT";
const SENDER_EMAIL = "info@nobelspiritlabs.store";

export async function sendResendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Walid Kenawy <${SENDER_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Resend API Error:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Resend Connection Failed:", error);
    return false;
  }
}
