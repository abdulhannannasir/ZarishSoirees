"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { FINALE } from "./content";

/**
 * The "Schedule a Private Consultation" form: a dark dialog with name, event date, venue, guest
 * count and the services needed.
 *
 * There is no server behind this site, so sending the form prepares a WhatsApp message with the
 * details and opens it in a new tab for the visitor to send; nothing is stored anywhere. All the
 * copy, field labels, required flags and service options live in `FINALE.consultation`
 * (content.ts). To receive requests by email or in a CRM later, replace the body of `onSubmit`.
 *
 * It must stay mounted at the top level of the page (not inside a scene): scenes are transformed,
 * which would break its fixed positioning. Typed values survive an accidental close.
 */

type Draft = { name: string; date: string; venue: string; guests: string; services: string[] };
type FieldKey = "name" | "date" | "venue" | "guests";
type FieldErrors = Partial<Record<FieldKey, string>>;

const C = FINALE.consultation;
const WHATSAPP_URL = FINALE.whatsapp.url;

const EMPTY: Draft = { name: "", date: "", venue: "", guests: "", services: [] };
const FIELD_ORDER: readonly FieldKey[] = ["name", "date", "venue", "guests"];
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const inputClass =
  "mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-label text-base text-white placeholder:text-white/35 focus:border-[#d9a441] focus:outline-none focus:ring-2 focus:ring-[#d9a441]/30 aria-[invalid=true]:border-[#ff8a9b]";

function validate(draft: Draft, minDate: string): FieldErrors {
  const f = C.fields;
  const errors: FieldErrors = {};
  if (f.name.required && !draft.name.trim()) errors.name = f.name.error;
  if (!draft.date) {
    if (f.date.required) errors.date = f.date.error;
  } else if (minDate && draft.date < minDate) {
    errors.date = f.date.pastError;
  }
  if (f.venue.required && !draft.venue.trim()) errors.venue = f.venue.error;
  const guests = draft.guests.trim();
  if (guests ? !/^\d{1,5}$/.test(guests) || Number(guests) < 1 : f.guests.required) {
    errors.guests = f.guests.error;
  }
  return errors;
}

/** "2026-12-05" -> "5 December 2026", without a time-zone shift. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, day),
  );
}

function buildMessage(draft: Draft): string {
  const f = C.fields;
  const lines = [C.messageGreeting, ""];
  if (draft.name.trim()) lines.push(`${f.name.label}: ${draft.name.trim()}`);
  if (draft.date) lines.push(`${f.date.label}: ${formatDate(draft.date)}`);
  if (draft.venue.trim()) lines.push(`${f.venue.label}: ${draft.venue.trim()}`);
  if (draft.guests.trim()) lines.push(`${f.guests.label}: ${draft.guests.trim()}`);
  // In the form's own order, not the order they were ticked, so the same choices read the same.
  const services = f.services.options.filter((option) => draft.services.includes(option));
  if (services.length) lines.push(`${f.services.label}: ${services.join(", ")}`);
  return lines.join("\n");
}

function Field({
  id,
  label,
  required,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block font-label text-[11px] uppercase tracking-[0.18em] text-white/60"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-[#d9a441]">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 font-label text-xs text-[#ff8a9b]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ConsultationModal({
  open,
  onClose,
  minDate,
}: {
  open: boolean;
  onClose: () => void;
  /** Earliest selectable event date, YYYY-MM-DD (today). Set by the page when the form opens. */
  minDate: string;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  /** Set once the form has been sent: the WhatsApp link we opened, kept as a fallback. */
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const sentLinkRef = useRef<HTMLAnchorElement>(null);

  // Closing after a send starts the next request from a clean form; closing mid-way keeps it.
  const close = useCallback(() => {
    if (sentUrl) {
      setDraft(EMPTY);
      setErrors({});
      setSentUrl(null);
    }
    onClose();
  }, [sentUrl, onClose]);

  // Move focus into the dialog on open, and give it back to the button that opened it on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nameRef.current?.focus();
    return () => opener?.focus();
  }, [open]);

  // Sending replaces the form, and the field that had focus goes with it: hand focus to the
  // fallback link so keyboard users are not left on the page behind the dialog.
  useEffect(() => {
    if (sentUrl) sentLinkRef.current?.focus();
  }, [sentUrl]);

  // Escape closes; Tab and Shift+Tab cycle inside the dialog. This listens on the window rather
  // than on the panel so it also catches focus that has slipped out of it (for example after a
  // click on the dialog's plain text, which leaves focus on the page behind).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      const items = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!panel || !items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const set = (key: Exclude<keyof Draft, "services">, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleService = (option: string) =>
    setDraft((d) => ({
      ...d,
      services: d.services.includes(option)
        ? d.services.filter((s) => s !== option)
        : [...d.services, option],
    }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate(draft, minDate);
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((key) => next[key]);
    if (firstInvalid) {
      panelRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    const url = `${WHATSAPP_URL}?text=${encodeURIComponent(buildMessage(draft))}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
  };

  if (!open) return null;

  const f = C.fields;
  const describedBy = (key: FieldKey) => (errors[key] ? `consult-${key}-error` : undefined);

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-4 sm:p-8"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-title"
          aria-describedby="consult-intro"
          className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0b10] p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:p-9"
        >
          {/* A zero-height sticky row spanning the panel, so the close button stays in view while a
              tall form scrolls on a phone. The negative margins cancel the panel's padding. */}
          <div className="sticky top-0 z-10 -mx-6 -mt-6 h-0 sm:-mx-9 sm:-mt-9">
            <button
              type="button"
              onClick={close}
              aria-label={C.closeLabel}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/10 bg-[#0c0b10]/90 text-white/70 backdrop-blur-sm transition-colors hover:bg-[#1c1b22] hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {sentUrl ? (
            <div role="status" className="py-4 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full border border-[#d9a441]/60 text-[#d9a441]">
                <Check className="size-5" aria-hidden="true" />
              </span>
              <h3 id="consult-title" className="mt-5 font-display text-[1.9rem] font-medium">
                {C.sent.title}
              </h3>
              <p
                id="consult-intro"
                className="mx-auto mt-2 max-w-sm font-label text-[0.95rem] font-light text-white/70"
              >
                {C.sent.body}
              </p>
              <a
                ref={sentLinkRef}
                href={sentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="wl-gold mt-6 inline-flex h-[3.1rem] items-center justify-center gap-2.5 rounded-full px-8 font-label text-[0.95rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dfb6]"
              >
                <MessageCircle className="size-[1.15rem]" aria-hidden="true" />
                {C.sent.linkLabel}
                <span className="sr-only"> {FINALE.whatsapp.newTabNote}</span>
              </a>
              <button
                type="button"
                onClick={close}
                className="mt-3 block w-full font-label text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
              >
                {C.closeLabel}
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit}>
              <h3
                id="consult-title"
                className="pr-10 font-display text-[1.9rem] font-medium leading-tight sm:text-[2.2rem]"
              >
                {C.title}
              </h3>
              <p id="consult-intro" className="mt-2 font-label text-[0.95rem] font-light text-white/65">
                {C.intro}
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  id="consult-name"
                  label={f.name.label}
                  required={f.name.required}
                  error={errors.name}
                  className="sm:col-span-2"
                >
                  <input
                    ref={nameRef}
                    id="consult-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={f.name.placeholder}
                    aria-required={f.name.required}
                    aria-invalid={!!errors.name}
                    aria-describedby={describedBy("name")}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="consult-date"
                  label={f.date.label}
                  required={f.date.required}
                  error={errors.date}
                >
                  <input
                    id="consult-date"
                    name="date"
                    type="date"
                    min={minDate || undefined}
                    value={draft.date}
                    onChange={(e) => set("date", e.target.value)}
                    aria-required={f.date.required}
                    aria-invalid={!!errors.date}
                    aria-describedby={describedBy("date")}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                </Field>

                <Field
                  id="consult-guests"
                  label={f.guests.label}
                  required={f.guests.required}
                  error={errors.guests}
                >
                  <input
                    id="consult-guests"
                    name="guests"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={draft.guests}
                    onChange={(e) => set("guests", e.target.value)}
                    placeholder={f.guests.placeholder}
                    aria-required={f.guests.required}
                    aria-invalid={!!errors.guests}
                    aria-describedby={describedBy("guests")}
                    className={inputClass}
                  />
                </Field>

                <Field
                  id="consult-venue"
                  label={f.venue.label}
                  required={f.venue.required}
                  error={errors.venue}
                  className="sm:col-span-2"
                >
                  <input
                    id="consult-venue"
                    name="venue"
                    type="text"
                    autoComplete="off"
                    value={draft.venue}
                    onChange={(e) => set("venue", e.target.value)}
                    placeholder={f.venue.placeholder}
                    aria-required={f.venue.required}
                    aria-invalid={!!errors.venue}
                    aria-describedby={describedBy("venue")}
                    className={inputClass}
                  />
                </Field>

                <fieldset className="sm:col-span-2">
                  <legend className="font-label text-[11px] uppercase tracking-[0.18em] text-white/60">
                    {f.services.label}
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {f.services.options.map((option) => {
                      const on = draft.services.includes(option);
                      return (
                        <label key={option} className="relative flex cursor-pointer">
                          <input
                            type="checkbox"
                            name="services"
                            value={option}
                            checked={on}
                            onChange={() => toggleService(option)}
                            className="peer sr-only"
                          />
                          <span
                            className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 font-label text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#d9a441]/70 ${
                              on
                                ? "border-[#d9a441] bg-[#d9a441]/10 text-white"
                                : "border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30"
                            }`}
                          >
                            <span
                              className={`grid size-[1.05rem] shrink-0 place-items-center rounded-[5px] border transition-colors ${
                                on
                                  ? "border-[#d9a441] bg-[#d9a441] text-[#1a1208]"
                                  : "border-white/30"
                              }`}
                            >
                              {on && <Check className="size-3" strokeWidth={3} aria-hidden="true" />}
                            </span>
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="mt-7">
                <button
                  type="submit"
                  className="wl-gold inline-flex h-[3.1rem] w-full items-center justify-center gap-2.5 rounded-full font-label text-[0.95rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3dfb6]"
                >
                  <MessageCircle className="size-[1.15rem]" aria-hidden="true" />
                  {C.submitLabel}
                </button>
                <p className="mt-3 text-center font-label text-xs font-light text-white/45">
                  {C.privacyNote}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
