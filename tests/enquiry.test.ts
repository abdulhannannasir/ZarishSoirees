import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ENQUIRY, WHATSAPP_NUMBER, whatsapp } from "../src/config/business.ts";
import {
  buildEmail,
  cleanValues,
  deliveryAccepted,
  emptyValues,
  formatDate,
  normalizePhone,
  summaryLines,
  todayInPakistan,
  toDeliveryPayload,
  validate,
  whatsappLink,
  type EnquiryValues,
} from "../src/lib/enquiry.ts";

const TODAY = "2026-10-27";
const valid = (overrides: Partial<EnquiryValues> = {}): EnquiryValues => ({
  ...emptyValues(),
  name: "Ayesha Khan",
  phone: "0313 7027761",
  eventType: "Wedding",
  ...overrides,
});

describe("normalizePhone", () => {
  it("turns local Pakistani numbers into WhatsApp form", () => {
    assert.equal(normalizePhone("0313 7027761"), "923137027761");
    assert.equal(normalizePhone("0313-7027761"), "923137027761");
    assert.equal(normalizePhone("313 7027761"), "923137027761");
  });
  it("keeps numbers that already have a country code", () => {
    assert.equal(normalizePhone("+92 313 7027761"), "923137027761");
    assert.equal(normalizePhone("0092 313 7027761"), "923137027761");
    assert.equal(normalizePhone("+44 7700 900123"), "447700900123");
  });
  it("rejects things that are not phone numbers", () => {
    assert.equal(normalizePhone(""), null);
    assert.equal(normalizePhone("call me"), null);
    assert.equal(normalizePhone("12345"), null);
    assert.equal(normalizePhone("+1234567890123456"), null);
  });
});

describe("validate", () => {
  it("accepts the three essential fields on their own", () => {
    assert.deepEqual(validate(valid(), TODAY), {});
  });
  it("requires name, phone and event type", () => {
    const errors = validate(emptyValues(), TODAY);
    assert.deepEqual(errors, { name: "required", phone: "required", eventType: "required" });
  });
  it("rejects an invalid phone number and an unknown event type", () => {
    const errors = validate(valid({ phone: "abc", eventType: "Circus" }), TODAY);
    assert.equal(errors.phone, "invalid");
    assert.equal(errors.eventType, "invalid");
  });
  it("checks the event date: real, and not in the past", () => {
    assert.equal(validate(valid({ date: "2026-12-05" }), TODAY).date, undefined);
    assert.equal(validate(valid({ date: TODAY }), TODAY).date, undefined);
    assert.equal(validate(valid({ date: "2026-10-26" }), TODAY).date, "past");
    assert.equal(validate(valid({ date: "2026-02-30" }), TODAY).date, "invalid");
    assert.equal(validate(valid({ date: "next friday" }), TODAY).date, "invalid");
  });
  it("checks the guest count", () => {
    assert.equal(validate(valid({ guests: "150" }), TODAY).guests, undefined);
    assert.equal(validate(valid({ guests: "0" }), TODAY).guests, "invalid");
    assert.equal(validate(valid({ guests: "12.5" }), TODAY).guests, "invalid");
    assert.equal(validate(valid({ guests: String(ENQUIRY.guestsMax + 1) }), TODAY).guests, "invalid");
  });
  it("only accepts the configured budget ranges", () => {
    assert.equal(validate(valid({ budget: ENQUIRY.budgetRanges[1] }), TODAY).budget, undefined);
    assert.equal(validate(valid({ budget: "PKR 5" }), TODAY).budget, "invalid");
  });
  it("limits the length of free text", () => {
    assert.equal(validate(valid({ details: "x".repeat(ENQUIRY.limits.details + 1) }), TODAY).details, "tooLong");
    assert.equal(validate(valid({ name: "x".repeat(ENQUIRY.limits.name + 1) }), TODAY).name, "tooLong");
  });
});

describe("cleanValues", () => {
  it("trims, folds spaces, drops control characters and ignores non-strings", () => {
    const cleaned = cleanValues({
      name: "  Ayesha \u0007  Khan ",
      details: "Line one\r\nLine two\u0000 ",
      guests: 150,
      venue: undefined,
    });
    assert.equal(cleaned.name, "Ayesha Khan");
    assert.equal(cleaned.details, "Line one\nLine two");
    assert.equal(cleaned.guests, "");
    assert.equal(cleaned.venue, "");
  });
});

describe("messages", () => {
  const values = valid({ date: "2026-12-05", guests: "250", budget: ENQUIRY.budgetRanges[2], details: "Mehndi and baraat" });

  it("formats dates for people", () => {
    assert.equal(formatDate("2026-12-05"), "5 December 2026");
    assert.equal(formatDate("soon"), "soon");
  });
  it("lists only the answers that were given, in order", () => {
    assert.deepEqual(summaryLines(valid()), [
      "Name: Ayesha Khan",
      "WhatsApp / phone: 0313 7027761",
      "Event: Wedding",
    ]);
    assert.ok(summaryLines(values).includes("Date: 5 December 2026"));
  });
  it("builds a WhatsApp link to the configured number with the answers in the text", () => {
    const link = new URL(whatsappLink(values, "Hello The Wed Theory"));
    assert.equal(link.origin + link.pathname, `https://wa.me/${WHATSAPP_NUMBER}`);
    const text = link.searchParams.get("text") ?? "";
    assert.ok(text.startsWith("Hello The Wed Theory\n\nName: Ayesha Khan"));
    assert.ok(text.includes("Guests: 250"));
  });
  it("encodes the message so it survives a URL", () => {
    assert.equal(new URL(whatsapp("a & b? c")).searchParams.get("text"), "a & b? c");
  });
  it("builds the delivery payload the API forwards", () => {
    const payload = toDeliveryPayload(values, { pageUrl: "https://example.com/", receivedAt: "2026-10-27T00:00:00.000Z" });
    assert.equal(payload.phoneDigits, "923137027761");
    assert.equal(payload.whatsappChat, "https://wa.me/923137027761");
    assert.equal(payload.source, "thewedtheory-website");
    assert.ok(payload.text.includes("Event: Wedding"));
  });
});

describe("buildEmail", () => {
  const payload = toDeliveryPayload(
    valid({ name: "Ayesha\nKhan", date: "2026-12-05", details: "Rooftop mehndi" }),
    { pageUrl: "https://example.com/contact", receivedAt: "2026-10-27T10:00:00.000Z" },
  );
  const email = buildEmail(payload, { from: "Studio <a@b.dev>", to: ["inbox@example.com"] });

  it("addresses the studio from the configured sender", () => {
    assert.equal(email.from, "Studio <a@b.dev>");
    assert.deepEqual(email.to, ["inbox@example.com"]);
  });
  it("puts the answers, a WhatsApp link and the page in the body", () => {
    assert.ok(email.text.includes("Event: Wedding"));
    assert.ok(email.text.includes("Date: 5 December 2026"));
    assert.ok(email.text.includes("Details: Rooftop mehndi"));
    assert.ok(email.text.includes("Reply on WhatsApp: https://wa.me/923137027761"));
    assert.ok(email.text.includes("Sent from: https://example.com/contact"));
  });
  it("keeps the subject on one line whatever was typed, and short", () => {
    assert.equal(email.subject, "New enquiry: Ayesha Khan (Wedding)");
    const long = buildEmail({ ...payload, name: "x\r\ny ".repeat(200) }, { from: "a@b.dev", to: ["c@d.dev"] });
    assert.ok(!/[\r\n]/.test(long.subject));
    assert.ok(long.subject.length <= 150);
  });
});

describe("deliveryAccepted", () => {
  const answer = (ok: boolean, contentType: string | null, body: string) => ({ ok, contentType, body });

  it("accepts what real destinations answer", () => {
    assert.equal(deliveryAccepted(answer(true, "application/json", '{"ok":true,"next":"/thanks"}')), true);
    assert.equal(deliveryAccepted(answer(true, "application/json", '{"status":"success"}')), true);
    assert.equal(deliveryAccepted(answer(true, "text/plain", "Accepted")), true);
    assert.equal(deliveryAccepted(answer(true, null, "")), true);
  });
  it("refuses an error status", () => {
    assert.equal(deliveryAccepted(answer(false, "application/json", '{"ok":true}')), false);
  });
  it("refuses a 200 that carries a web page (an Apps Script that is not shared, or that crashed)", () => {
    assert.equal(deliveryAccepted(answer(true, "text/html; charset=utf-8", "<html>Sign in</html>")), false);
    assert.equal(deliveryAccepted(answer(true, null, "  <!DOCTYPE html><title>Error</title>")), false);
  });
  it("refuses an explicit failure in a 200 answer", () => {
    assert.equal(deliveryAccepted(answer(true, "application/json", '{"ok":false,"error":"forbidden"}')), false);
    assert.equal(deliveryAccepted(answer(true, "application/json", '{"success":false}')), false);
  });
});

describe("todayInPakistan", () => {
  it("uses Pakistan time, which is five hours ahead of UTC", () => {
    assert.equal(todayInPakistan(new Date("2026-10-27T20:30:00Z")), "2026-10-28");
    assert.equal(todayInPakistan(new Date("2026-10-27T10:00:00Z")), "2026-10-27");
  });
});
