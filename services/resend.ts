
/**
 * RESEND EMAIL DELIVERY SERVICE
 * Handles outgoing strategic communications via the Resend API.
 */

const RESEND_API_KEY = "re_2EbjmAHe_E8jzpF8be7uhz1YrZ14vpkoj";
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
      const err = await response.json().catch(() => ({ message: "Unknown API Error" }));
      console.error("Resend API Failure:", err);
      return false;
    }

    return true;
  } catch (error) {
    // Specifically handle the "Load failed" error which usually indicates a CORS block or network interruption
    if (error instanceof TypeError && error.message === "Load failed") {
      console.error("Resend Connection Failed: Browser CORS policy or Network block detected. Transmittal aborted safely.");
    } else {
      console.error("Resend Dispatch Exception:", error);
    }
    return false;
  }
}
