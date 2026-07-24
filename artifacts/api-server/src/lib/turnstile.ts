export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const isDev = process.env.NODE_ENV === "development";
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (isDev) {
      // Deliberate, explicit local-dev convenience only — requires NODE_ENV=development,
      // not just an absent secret, so a misconfigured prod deploy can't silently bypass this.
      console.warn("[turnstile] No secret configured — bypassing in development only");
      return true;
    }
    // Missing secret in a non-dev environment must fail CLOSED (block), never fail open.
    console.error("[turnstile] TURNSTILE_SECRET_KEY missing in non-dev environment");
    return false;
  }

  if (!token) return false;

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
