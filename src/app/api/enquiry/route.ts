import { NextResponse } from "next/server";
import { ENQUIRY } from "@/config/business";
import {
  buildEmail,
  cleanValues,
  deliveryAccepted,
  toDeliveryPayload,
  validate,
} from "@/lib/enquiry";

/**
 * Receives an enquiry from the form and delivers it to the studio.
 *
 * WHERE IT GOES. By email through Resend when RESEND_API_KEY and ENQUIRY_EMAIL_TO are set, and/or as a
 * JSON POST to the URL in ENQUIRY_WEBHOOK_URL (Formspree, Make, Zapier, n8n, your own CRM; with
 * ENQUIRY_WEBHOOK_TOKEN also set it is sent as a Bearer token). If both are set it tries both and
 * counts the enquiry as delivered if either accepted it. None of these settings reach the browser.
 * See docs/the-wed-theory.md, "Receiving enquiries".
 *
 * HONESTY. It answers 200 only after the destination has accepted the enquiry (a 2xx that comes with a
 * web page or `{"ok": false}` is not acceptance: see deliveryAccepted). With no destination
 * configured it answers 503 `not_configured`, and the form then offers the visitor a ready-made
 * WhatsApp message instead of pretending anything was sent.
 *
 * It checks everything again here (the browser's checks are a convenience, not a defence), caps the
 * size of what it accepts, quietly drops submissions that fill the hidden honeypot field, and
 * slows down a single address that sends many.
 */

const EMAIL_API_URL = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 12_000;
const DELIVERY_TIMEOUT_MS = 8_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

/** Recent submissions per address. Per server instance, so it is a speed bump, not a wall. */
const recent = new Map<string, number[]>();

function tooMany(address: string): boolean {
  const now = Date.now();
  const hits = (recent.get(address) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(address, hits);
  // Keep the table from growing without limit.
  if (recent.size > 2_000) for (const key of recent.keys()) recent.delete(key);
  return hits.length > MAX_PER_WINDOW;
}

const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ ok: false, error, ...extra }, { status });

/** Only https destinations (or localhost, for trying it out), so an enquiry is never sent in the clear. */
function destinationUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return url.protocol === "https:" || (url.protocol === "http:" && local) ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(address)) return fail("rate_limited", 429);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return fail("too_large", 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fail("invalid", 400);
    body = parsed as Record<string, unknown>;
  } catch {
    return fail("invalid", 400);
  }

  // The honeypot: a field people never see, so only a script fills it. Looks like success to the script.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const values = cleanValues(body);
  const errors = validate(values);
  if (Object.keys(errors).length > 0) return fail("invalid", 400, { errors });

  const webhook = webhookDestination();
  const email = emailSettings();
  if (!webhook && !email) return fail("not_configured", 503);

  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 300) : "";
  const payload = toDeliveryPayload(values, { pageUrl, receivedAt: new Date().toISOString() });

  // Every configured route is tried; the enquiry counts as delivered if at least one accepted it.
  const results = await Promise.all([
    webhook ? sendToWebhook(webhook, payload) : false,
    email ? sendEmail(email, payload) : false,
  ]);
  if (!results.some(Boolean)) return fail("delivery_failed", 502);
  return NextResponse.json({ ok: true });
}

type Payload = ReturnType<typeof toDeliveryPayload>;

/** The delivery URL, if one is set and acceptable. */
function webhookDestination(): URL | null {
  const configured = process.env[ENQUIRY.destinationEnv];
  if (!configured) return null;
  const url = destinationUrl(configured);
  if (!url) console.error(`${ENQUIRY.destinationEnv} must be an https:// URL.`);
  return url;
}

/** The email settings, if the API key and the inbox are both set. */
function emailSettings() {
  const apiKey = process.env[ENQUIRY.emailEnv.apiKey];
  const to = (process.env[ENQUIRY.emailEnv.to] ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (!apiKey || to.length === 0) return null;
  const from = process.env[ENQUIRY.emailEnv.from]?.trim() || ENQUIRY.defaultEmailFrom;
  return { apiKey, to, from };
}

/** POSTs the enquiry as JSON to the configured URL. True only if the destination really accepted it. */
async function sendToWebhook(destination: URL, payload: Payload): Promise<boolean> {
  const token = process.env.ENQUIRY_WEBHOOK_TOKEN;
  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    const answer = (await response.text()).slice(0, 2_000);
    const accepted = deliveryAccepted({
      ok: response.ok,
      contentType: response.headers.get("content-type"),
      body: answer,
    });
    // The status only: never log what the visitor wrote.
    if (!accepted) console.error(`Enquiry destination did not confirm (status ${response.status}).`);
    return accepted;
  } catch (error) {
    console.error("Enquiry could not be delivered:", error instanceof Error ? error.name : "error");
    return false;
  }
}

/** Emails the enquiry to the studio through Resend. True only if Resend accepted it. */
async function sendEmail(
  settings: NonNullable<ReturnType<typeof emailSettings>>,
  payload: Payload,
): Promise<boolean> {
  const endpoint = destinationUrl(process.env.ENQUIRY_EMAIL_API_URL || EMAIL_API_URL);
  if (!endpoint) return false;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
        "User-Agent": "thewedtheory-website",
      },
      body: JSON.stringify(buildEmail(payload, { from: settings.from, to: settings.to })),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    if (!response.ok) {
      // The service's own reason (such as an unverified sender) helps the studio fix it; it never
      // contains what the visitor wrote.
      const reason = (await response.text().catch(() => "")).slice(0, 300);
      console.error(`Email service answered ${response.status}: ${reason}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Enquiry email could not be sent:", error instanceof Error ? error.name : "error");
    return false;
  }
}

/** The form only ever posts; anything else is told so plainly. */
export function GET() {
  return fail("method_not_allowed", 405);
}
