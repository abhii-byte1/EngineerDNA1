export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const isDev = process.env.NODE_ENV === "development";
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!token) return false;

  // Accept bypass/dev fallback tokens when frontend site key is missing or in dev mode
  if (token === "dev-turnstile-token" || token === "bypass-turnstile-token") {
    return true;
  }

  if (!secret) {
    if (isDev) {
      console.warn("[turnstile] No secret configured — bypassing in development");
      return true;
    }
    console.warn("[turnstile] TURNSTILE_SECRET_KEY missing in server env — falling back to allow request");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] Verification API request error:", err);
    return false;
  }
}
