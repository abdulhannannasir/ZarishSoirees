/**
 * The enquiry form's rules, shared by the form in the browser, the API route on the server and the
 * unit tests (tests/enquiry.test.ts). Plain TypeScript with no framework imports, so all three can
 * load it. It returns error *codes*; the words shown to visitors live in content.ts (CONTACT.form).
 */

import { ENQUIRY, whatsapp } from "../config/business.ts";

export const FIELD_ORDER = [
  "name",
  "phone",
  "eventType",
  "date",
  "venue",
  "guests",
  "budget",
  "details",
] as const;

export type EnquiryField = (typeof FIELD_ORDER)[number];
export type EnquiryValues = Record<EnquiryField, string>;
export type EnquiryErrorCode = "required" | "invalid" | "tooLong" | "past";
export type EnquiryErrors = Partial<Record<EnquiryField, EnquiryErrorCode>>;

/** The short label each answer gets in the WhatsApp message and in the delivered enquiry. */
export const SUMMARY_LABELS: Record<EnquiryField, string> = {
  name: "Name",
  phone: "WhatsApp / phone",
  eventType: "Event",
  date: "Date",
  venue: "Venue or city",
  guests: "Guests",
  budget: "Budget",
  details: "Details",
};

export const emptyValues = (): EnquiryValues =>
  Object.fromEntries(FIELD_ORDER.map((field) => [field, ""])) as EnquiryValues;

/** Trims every answer, folds runs of spaces in the one-line fields and drops control characters. */
export function cleanValues(raw: Partial<Record<EnquiryField, unknown>>): EnquiryValues {
  const values = emptyValues();
  for (const field of FIELD_ORDER) {
    const value = raw[field];
    if (typeof value !== "string") continue;
    const withoutControls = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
    values[field] =
      field === "details"
        ? withoutControls.replace(/\r\n?/g, "\n").trim()
        : withoutControls.replace(/\s+/g, " ").trim();
  }
  return values;
}

/**
 * Turns a phone number as people type it into digits with the country code first, the form wa.me
 * wants: "0313 7027761" and "+92 313 7027761" both become "923137027761". Returns null for anything
 * that cannot be a phone number.
 */
export function normalizePhone(raw: string): string | null {
  const text = raw.trim();
  if (!/^\+?[\d\s\-().]+$/.test(text)) return null;
  const hasPlus = text.startsWith("+");
  let digits = text.replace(/\D/g, "");
  if (!hasPlus) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    // Pakistani mobiles written the local way: 03xx xxxxxxx, or 3xx xxxxxxx without the zero.
    else if (/^0\d{10}$/.test(digits)) digits = `92${digits.slice(1)}`;
    else if (/^3\d{9}$/.test(digits)) digits = `92${digits}`;
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/** Whether "YYYY-MM-DD" is a real calendar day. */
function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Today's date as "YYYY-MM-DD" in the studio's timezone (Pakistan Standard Time, UTC+5). */
export function todayInPakistan(now: Date = new Date()): string {
  return new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Checks a set of (already cleaned) answers. Only the name, a way to reach the visitor and the kind
 * of event are required: everything else helps the studio but must never stand in the way.
 */
export function validate(values: EnquiryValues, today: string = todayInPakistan()): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const { limits, eventTypes, budgetRanges, guestsMax } = ENQUIRY;

  if (!values.name) errors.name = "required";
  else if (values.name.length > limits.name) errors.name = "tooLong";

  if (!values.phone) errors.phone = "required";
  else if (!normalizePhone(values.phone)) errors.phone = "invalid";

  if (!values.eventType) errors.eventType = "required";
  else if (!(eventTypes as readonly string[]).includes(values.eventType)) errors.eventType = "invalid";

  if (values.date) {
    if (!isRealDate(values.date)) errors.date = "invalid";
    else if (values.date < today) errors.date = "past";
  }

  if (values.venue.length > limits.venue) errors.venue = "tooLong";

  if (values.guests) {
    const guests = Number(values.guests);
    if (!/^\d{1,5}$/.test(values.guests) || guests < 1 || guests > guestsMax) {
      errors.guests = "invalid";
    }
  }

  if (values.budget && !(budgetRanges as readonly string[]).includes(values.budget)) {
    errors.budget = "invalid";
  }

  if (values.details.length > limits.details) errors.details = "tooLong";

  return errors;
}

/** "2026-12-05" as "5 December 2026". Anything that is not such a date is returned unchanged. */
export function formatDate(value: string): string {
  if (!isRealDate(value)) return value;
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** The answers the visitor gave, one "Label: value" line each, in form order. */
export function summaryLines(values: EnquiryValues): string[] {
  return FIELD_ORDER.filter((field) => values[field]).map((field) => {
    const value = field === "date" ? formatDate(values[field]) : values[field];
    return `${SUMMARY_LABELS[field]}: ${value}`;
  });
}

/** The WhatsApp link that opens a chat with the studio, the visitor's answers already typed out. */
export function whatsappLink(values: EnquiryValues, greeting: string): string {
  return whatsapp([greeting, "", ...summaryLines(values)].join("\n"));
}

/** What the API forwards to the configured destination. */
export function toDeliveryPayload(values: EnquiryValues, meta: { pageUrl: string; receivedAt: string }) {
  return {
    ...values,
    phoneDigits: normalizePhone(values.phone),
    whatsappChat: normalizePhone(values.phone)
      ? `https://wa.me/${normalizePhone(values.phone)}`
      : null,
    source: "thewedtheory-website",
    pageUrl: meta.pageUrl,
    receivedAt: meta.receivedAt,
    // A plain-text version for destinations that only show one text field (an email body, a chat message).
    text: summaryLines(values).join("\n"),
  };
}

/** The request body for the email service (Resend): the enquiry as a plain-text email to the studio. */
export function buildEmail(
  payload: ReturnType<typeof toDeliveryPayload>,
  { from, to }: { from: string; to: string[] },
) {
  const lines = [
    "A new enquiry came in on the website.",
    "",
    payload.text,
    "",
    ...(payload.whatsappChat ? [`Reply on WhatsApp: ${payload.whatsappChat}`] : []),
    ...(payload.pageUrl ? [`Sent from: ${payload.pageUrl}`] : []),
    `Received: ${payload.receivedAt}`,
  ];
  return {
    from,
    to,
    // One line, whatever the visitor typed.
    subject: `New enquiry: ${payload.name} (${payload.eventType})`.replace(/\s+/g, " ").slice(0, 150),
    text: lines.join("\n"),
  };
}

/**
 * Did the destination really take the enquiry? A 2xx status alone is not proof: a Google Apps Script web
 * app that is not shared with "Anyone" (or that fails) answers 200 with a web page, and a script can answer
 * `{"ok": false}`. Both count as not delivered. JSON, plain text ("Accepted") and an empty body count as taken.
 */
export function deliveryAccepted(response: {
  ok: boolean;
  contentType: string | null;
  body: string;
}): boolean {
  if (!response.ok) return false;
  const looksLikeAPage =
    (response.contentType ?? "").toLowerCase().includes("text/html") ||
    /^\s*<(!doctype html|html)/i.test(response.body);
  if (looksLikeAPage) return false;
  try {
    const parsed: unknown = JSON.parse(response.body);
    if (parsed && typeof parsed === "object") {
      const { ok, success } = parsed as { ok?: unknown; success?: unknown };
      if (ok === false || success === false) return false;
    }
  } catch {
    // Not JSON: plain text such as "Accepted" is fine.
  }
  return true;
}
