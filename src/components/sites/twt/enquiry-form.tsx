"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Loader2, MessageCircle } from "lucide-react";
import { useSearchString } from "@/hooks/use-search-string";
import {
  FIELD_ORDER,
  cleanValues,
  todayInPakistan,
  validate,
  whatsappLink,
  type EnquiryErrorCode,
  type EnquiryField,
} from "@/lib/enquiry";
import { cn } from "@/lib/utils";
import { ENQUIRY } from "@/config/business";
import { CONTACT } from "./content";
import type { TheoryPrefill } from "./theory";

const { form } = CONTACT;

type Errors = Partial<Record<EnquiryField, string>>;
type Status = "idle" | "sending" | "sent" | "unavailable";

/** How long the browser waits for the server before treating the enquiry as not sent. */
const SEND_TIMEOUT_MS = 15_000;

const noSubscription = () => () => {};

/** The words for an error code on a field, falling back to something kind and general. */
function messageFor(field: EnquiryField, code: EnquiryErrorCode): string {
  const messages = form.fields[field].errors as Partial<Record<EnquiryErrorCode, string>>;
  return messages[code] ?? "Please check this answer.";
}

// tap-target widens the label's touch area to 44px; a tap on a label just focuses its field.
const label =
  "tap-target block font-ui text-[11px] leading-none font-medium tracking-[0.18em] text-ink-soft uppercase";
const control =
  "block w-full min-h-11 border-0 border-b border-ink/35 bg-transparent px-0 font-ui text-[16px] font-light text-ink outline-none transition-colors duration-300 placeholder:text-ink-soft hover:border-ink/60 focus:border-ink focus-visible:border-ink focus-visible:shadow-[0_1px_0_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-clay aria-invalid:focus-visible:shadow-[0_1px_0_0_var(--color-clay)]";

interface FieldProps {
  name: EnquiryField;
  error?: string;
  required?: boolean;
  help?: string;
  className?: string;
  children: (props: {
    id: string;
    name: EnquiryField;
    disabled: boolean;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
    required: boolean | undefined;
  }) => ReactNode;
  disabled: boolean;
}

/** A label, its control, an optional hint and its error message, wired together for screen readers. */
function Field({ name, error, required, help, className, children, disabled }: FieldProps) {
  const id = `enquiry-${name}`;
  const describedBy = [help ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>
        {form.fields[name].label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children({
        id,
        name,
        disabled,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
        "aria-required": required || undefined,
        required: required || undefined,
      })}
      {help && !error ? (
        <p id={`${id}-help`} className="mt-1.5 font-ui text-[13px] leading-[1.4] text-ink-soft">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 font-ui text-[13.5px] leading-[1.35] text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The enquiry form. It checks the answers in the browser, sends them to /api/enquiry, which delivers
 * them to the studio, and only says "sent" once that has really happened. If delivery is not set up
 * or fails, it says exactly that and offers the same answers as a ready-made WhatsApp message.
 * See the note above `CONTACT` in content.ts and docs/the-wed-theory.md, "Receiving enquiries".
 */
export function EnquiryForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  // Today's date for the date field's lower limit: empty while the page is built and while it loads,
  // so the server and the browser agree, then the real date.
  const today = useSyncExternalStore(noSubscription, () => todayInPakistan(), () => "");
  // Bumped to start a fresh, empty form after a successful send.
  const [round, setRound] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Arriving from a quiz result: the address carries the result and the answers, which start the form
  // off. That code (and the quiz's copy) is only fetched when the address actually asks for it, so the
  // front page does not carry it.
  const search = useSearchString();
  const [prefill, setPrefill] = useState<TheoryPrefill>();
  useEffect(() => {
    // "t" is THEME_PARAM in theory.ts; the quiz code itself is not imported until it is needed.
    if (!new URLSearchParams(search).has("t")) return;
    let cancelled = false;
    import("./theory").then(({ readTheoryPrefill }) => {
      if (!cancelled) setPrefill(readTheoryPrefill(search));
    });
    return () => {
      cancelled = true;
    };
  }, [search]);
  // Arriving from a service page: ?service=birthdays chooses the event type.
  const service = new URLSearchParams(search).get("service") ?? "";
  const serviceType = (ENQUIRY.serviceEventTypes as Record<string, string>)[service];
  const eventType = prefill?.eventType ?? serviceType ?? "";
  // The prefilled fields are uncontrolled, so they start over when a prefill arrives or changes.
  const fresh = `${prefill?.themeId ?? "none"}-${eventType}-${round}`;
  const busy = status === "sending";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const values = cleanValues(Object.fromEntries(FIELD_ORDER.map((name) => [name, data.get(name)])));

    const found = validate(values, todayInPakistan());
    const messages: Errors = Object.fromEntries(
      Object.entries(found).map(([field, code]) => [field, messageFor(field as EnquiryField, code)]),
    );
    setErrors(messages);
    const firstInvalid = FIELD_ORDER.find((name) => messages[name]);
    if (firstInvalid) {
      setStatus("idle");
      (formElement.elements.namedItem(`${firstInvalid}`) as HTMLElement | null)?.focus();
      return;
    }

    setStatus("sending");
    // Ready in case the enquiry cannot be delivered.
    const chat = whatsappLink(values, form.messageGreeting);
    setWhatsappUrl(chat);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: String(data.get("website") ?? ""),
          pageUrl: window.location.href,
        }),
        signal: controller.signal,
      });
      const result: { ok?: boolean; errors?: Partial<Record<EnquiryField, EnquiryErrorCode>> } = await response
        .json()
        .catch(() => ({}));

      if (response.ok && result.ok) {
        setStatus("sent");
      } else if (response.status === 400 && result.errors) {
        // The server found something the browser did not: show it against the field.
        const serverMessages: Errors = {};
        for (const field of FIELD_ORDER) {
          const code = result.errors[field];
          if (code) serverMessages[field] = messageFor(field, code);
        }
        setErrors(serverMessages);
        setStatus("idle");
        return;
      } else {
        // Not configured, down or refused: nothing was sent, and we say so.
        setStatus("unavailable");
      }
    } catch {
      // Offline or timed out: the same honest answer.
      setStatus("unavailable");
    } finally {
      window.clearTimeout(timer);
    }
    // Move the reader to the result, which is announced as it appears.
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  /** Clears a field's error as soon as the visitor starts fixing it. */
  function onInput(event: FormEvent<HTMLFormElement>) {
    const { name } = event.target as HTMLInputElement;
    if (name in errors) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function startAgain() {
    formRef.current?.reset();
    setErrors({});
    setStatus("idle");
    setRound((value) => value + 1);
  }

  const f = form.fields;
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      ref={formRef}
      id={form.id}
      noValidate
      onSubmit={onSubmit}
      onInput={onInput}
      className="scroll-mt-24"
      aria-busy={busy}
    >
      <h2 className="font-serif text-[clamp(1.9rem,3vw,2.9rem)] leading-[1.1] font-normal text-ink">
        {form.title}
      </h2>
      <p className="mt-4 max-w-[32rem] font-ui text-[16px] leading-[1.6] font-light text-ink-soft">
        {form.intro}
      </p>
      {prefill && (
        <p className="mt-5 border-l-2 border-forest pl-4 font-ui text-[15px] leading-[1.5] text-ink">
          {form.theoryNote(prefill.themeName)}
        </p>
      )}

      {errorCount > 0 && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-clay bg-clay/6 px-4 py-3 font-ui text-[14.5px] leading-[1.4] text-clay"
        >
          {form.fixErrors}
        </p>
      )}

      <fieldset disabled={busy} className="contents">
        <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
          <Field name="name" error={errors.name} required disabled={busy}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="name"
                maxLength={120}
                placeholder={f.name.placeholder}
                className={control}
              />
            )}
          </Field>

          <Field name="phone" error={errors.phone} required help={f.phone.help} disabled={busy}>
            {(props) => (
              <input
                {...props}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder={f.phone.placeholder}
                className={control}
              />
            )}
          </Field>

          <Field
            key={`eventType-${fresh}`}
            name="eventType"
            error={errors.eventType}
            required
            disabled={busy}
          >
            {(props) => (
              <div className="relative">
                <select
                  {...props}
                  defaultValue={eventType}
                  className={cn(control, "appearance-none pr-7 invalid:text-ink-soft")}
                >
                  <option value="" disabled>
                    {f.eventType.placeholder}
                  </option>
                  {f.eventType.options.map((option) => (
                    <option key={option} value={option} className="text-ink">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-ink-soft"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
              </div>
            )}
          </Field>

          <Field name="date" error={errors.date} help={f.date.help} disabled={busy}>
            {(props) => (
              <input
                {...props}
                type="date"
                min={today || undefined}
                autoComplete="off"
                className={cn(control, "text-ink-soft")}
              />
            )}
          </Field>

          <Field name="venue" error={errors.venue} disabled={busy}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="off"
                maxLength={160}
                placeholder={f.venue.placeholder}
                className={control}
              />
            )}
          </Field>

          <Field name="guests" error={errors.guests} disabled={busy}>
            {(props) => (
              <input
                {...props}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={5}
                placeholder={f.guests.placeholder}
                className={control}
              />
            )}
          </Field>

          <Field
            key={`budget-${round}`}
            name="budget"
            error={errors.budget}
            className="sm:col-span-2"
            disabled={busy}
          >
            {(props) => (
              <div className="relative">
                <select
                  {...props}
                  defaultValue=""
                  className={cn(control, "appearance-none pr-7 invalid:text-ink-soft")}
                >
                  <option value="">{f.budget.placeholder}</option>
                  {f.budget.options.map((option) => (
                    <option key={option} value={option} className="text-ink">
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-ink-soft"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
              </div>
            )}
          </Field>

          <Field
            key={`details-${fresh}`}
            name="details"
            error={errors.details}
            className="sm:col-span-2"
            disabled={busy}
          >
            {(props) => (
              <textarea
                {...props}
                defaultValue={prefill?.details}
                rows={4}
                maxLength={1600}
                placeholder={f.details.placeholder}
                className={cn(control, "resize-y py-3 leading-[1.55]")}
              />
            )}
          </Field>
        </div>

        {/* A field only a script would fill in. People never see it or reach it with the keyboard. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this empty
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </fieldset>

      <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
        <button
          type="submit"
          disabled={busy}
          data-magnetic=""
          className="group inline-flex h-12 min-w-[11rem] items-center justify-center gap-3 bg-forest px-8 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-cream uppercase transition-colors duration-300 outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory active:opacity-85 disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 motion-safe:animate-spin" strokeWidth={1.6} aria-hidden="true" />
              {form.sendingLabel}
            </>
          ) : (
            <>
              {form.submitLabel}
              <ArrowRight
                className="size-[14px] transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </>
          )}
        </button>
        <p className="max-w-[26rem] font-ui text-[13px] leading-[1.5] text-ink-soft">
          {form.requiredNote}
        </p>
      </div>
      <p className="mt-5 max-w-[36rem] font-ui text-[12.5px] leading-[1.55] text-ink-soft">
        {form.privacyNote}
      </p>

      {/* Announced to screen readers as it appears. Only "sent" ever claims anything reached the studio. */}
      <div role="status" aria-live="polite" ref={resultRef} tabIndex={-1} className="outline-none">
        {status === "sent" && (
          <div className="mt-9 border-t border-line pt-7">
            <p className="font-serif text-[clamp(1.5rem,2.2vw,1.9rem)] leading-[1.15] text-ink italic">
              {form.sent.title}
            </p>
            <p className="mt-3 max-w-[32rem] font-ui text-[15.5px] leading-[1.6] font-light text-ink-soft">
              {form.sent.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2.5 font-ui text-[12px] font-medium tracking-[0.16em] text-ink uppercase outline-none focus-visible:underline focus-visible:underline-offset-8"
              >
                <MessageCircle className="size-4" strokeWidth={1.4} aria-hidden="true" />
                <span className="border-b border-ink/50 pb-0.5">{form.sent.linkLabel}</span>
              </a>
              <button
                type="button"
                onClick={startAgain}
                className="min-h-11 font-ui text-[12px] font-medium tracking-[0.16em] text-ink-soft uppercase underline-offset-8 outline-none hover:text-ink hover:underline focus-visible:text-ink focus-visible:underline"
              >
                {form.sent.newLabel}
              </button>
            </div>
          </div>
        )}
        {status === "unavailable" && (
          <div className="mt-9 border-t border-l-2 border-line border-l-clay pt-7 pl-5">
            <p className="font-serif text-[clamp(1.4rem,2vw,1.75rem)] leading-[1.15] text-ink italic">
              {form.unavailable.title}
            </p>
            <p className="mt-3 max-w-[32rem] font-ui text-[15.5px] leading-[1.6] font-light text-ink-soft">
              {form.unavailable.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-3 bg-forest px-6 font-ui text-[12.5px] leading-none font-medium tracking-[0.14em] text-cream uppercase transition-colors outline-none hover:bg-[#3b4936] focus-visible:ring-2 focus-visible:ring-forest/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
              >
                <MessageCircle className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />
                {form.unavailable.linkLabel}
              </a>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                className="min-h-11 font-ui text-[12px] font-medium tracking-[0.16em] text-ink-soft uppercase underline-offset-8 outline-none hover:text-ink hover:underline focus-visible:text-ink focus-visible:underline"
              >
                {form.unavailable.retryLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
