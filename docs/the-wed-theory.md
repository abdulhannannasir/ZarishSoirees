# The Wed Theory: site guide

The site has two parts:

- **The front page** (`/`): the immersive showcase (five showpieces and the founder finale), in
  `src/components/sites/wedding-wonderland/`. Its intro screen and its finale link to the pages below.
- **The inner pages**, brought over from the
  [thewedtheory](https://github.com/abdulhannannasir/thewedtheory) site (its `main` branch), in
  `src/components/sites/twt/` and `src/app/(pages)/`. They share a header, a footer and a floating
  Instagram button (`src/app/(pages)/layout.tsx`).

## Pages

| Address | What is on it |
| --- | --- |
| `/services` | The four celebrations as photo cards: Weddings, Birthdays, Social Events, Corporate Events. |
| `/services/weddings`, `/birthdays`, `/social-events`, `/corporate-events` | One page per celebration: introduction, what we plan, three highlights, how we work, a gallery, the other services and a call to action (WhatsApp, or the enquiry form with the event type already chosen: `/contact?service=birthdays`). |
| `/portfolio` | The five collections (grand entrances, bespoke stages, floral architecture, table settings, lighting), then a gallery of every picture on the site with category filters and a full-screen viewer. |
| `/about` | Our approach, how we work (four steps), what we plan, and a pile of photographs you can drag aside. |
| `/contact` | The contact details (WhatsApp +92 313 7027761, Instagram @thewedtheory, Lahore) and the enquiry form. |
| `/theory`, `/theory/<result>` | "Find your Wed Theory": a six-question quiz with four shareable results, each with a WhatsApp link and a pre-filled enquiry form. |
| `/api/enquiry` | The enquiry backend (POST only). |

Also included: a designed 404 page, `sitemap.xml`, `robots.txt`, a web app manifest, favicon and app
icons, share cards for every page (`public/share/`), and structured data for search engines on the
front page and the service pages.

## Where things live

| Want to change | Edit |
| --- | --- |
| The WhatsApp number, event types, budget ranges, field limits | `src/config/business.ts` |
| Contact details, navigation, footer, portfolio, about and form wording | `src/components/sites/twt/content.ts` |
| The services overview and the four celebration pages (words, photos, galleries) | `src/components/sites/twt/services-content.ts` |
| Portfolio gallery pictures, captions, categories | `src/components/sites/twt/portfolio-gallery-data.ts` |
| Quiz questions, results and logic | `theory-content.ts`, `theory.ts` |
| Enquiry form, its rules and the backend | `enquiry-form.tsx`, `src/lib/enquiry.ts` (shared by the form, the API and the tests), `src/app/api/enquiry/route.ts` |
| Links from the front page to the inner pages | `SITE_PAGES` in `src/components/sites/wedding-wonderland/content.ts` |
| Page titles, descriptions and share previews | `src/lib/metadata.ts`, each page's `metadata`, `src/app/layout.tsx` |
| Colours and fonts of the inner pages | `src/app/globals.css` (the brand palette under `:root`; the `.twt-page` rules) |

## Receiving enquiries

The form on `/contact` posts to `/api/enquiry`, which checks every answer again on the server
(name, phone, event type are required; date, venue, guests, budget and details are checked when
given) and delivers the enquiry to a destination **you configure with environment variables**
(`.env.example` lists them all). It answers "sent" only after the destination accepted it. Until a
destination is set, or if delivery fails, the form says plainly that nothing was sent and offers the
same answers as a ready-made WhatsApp message instead.

### Email to the studio inbox (Resend, recommended)

Free plan: 100 emails a day, 3,000 a month.

1. Sign up at [resend.com](https://resend.com) **with the inbox that should receive enquiries**, and
   confirm it. (Resend's shared test sender can only deliver to the address the account was created
   with. To send to other addresses, or from your own domain, verify a domain at Resend and set
   `ENQUIRY_EMAIL_FROM`.)
2. In Resend, API Keys, create a key with "Sending access".
3. In Vercel, open the project, Settings, Environment Variables, and add for **Production**:
   `RESEND_API_KEY` (the key; mark it Sensitive) and `ENQUIRY_EMAIL_TO` (the inbox; several can be
   separated by commas). Optionally `ENQUIRY_EMAIL_FROM`, such as
   `The Wed Theory <enquiries@yourdomain.com>`. Redeploy.
4. Send a test enquiry from the live form. If it does not arrive, check the spam folder, then the
   function logs in Vercel: the route logs the email service's reason (an unverified sender, a wrong
   key) but never what the visitor wrote.

Each email has the subject `New enquiry: <name> (<event type>)` and lists every answer, a `wa.me`
link to reply to the visitor on WhatsApp, the page it was sent from and the time.

### Or a webhook

Set `ENQUIRY_WEBHOOK_URL` to any service that accepts a JSON POST: Formspree, Make or Zapier (a catch
webhook), n8n or your own CRM. It must be `https://` (`http://localhost` is allowed for testing).
Optionally set `ENQUIRY_WEBHOOK_TOKEN`, sent as `Authorization: Bearer <token>`. The JSON has every
field plus `phoneDigits`, `whatsappChat`, `text` (all answers as plain text), `source`, `pageUrl` and
`receivedAt`. A webhook that answers with a web page or `{"ok": false}` does not count as accepted.

If both email and webhook are set, the enquiry is sent both ways and counts as delivered if either
accepted it.

### Spam and abuse

A hidden honeypot field catches bots (they are told "ok" and nothing is sent), the body is capped at
12 KB, and an address that sends more than 8 enquiries in 10 minutes is slowed down (per server
instance: a speed bump, not a wall).

### Trying it locally

```bash
cp .env.example .env.local   # fill in RESEND_API_KEY and ENQUIRY_EMAIL_TO
npm run dev                  # then send the form on http://localhost:3000/contact
npm test                     # unit tests for the enquiry rules, the message and the delivery payload
```

## Photos

The portfolio photographs are the brand's concept images; the birthday, social-event and
corporate-event pages use stand-in stock photographs from Unsplash (credits in
`docs/photo-credits.md`). The gallery says which is which in each caption. Replace them with the
studio's own event photography when you have it (same file names, or new paths in `content.ts`,
`services-content.ts` and `portfolio-gallery-data.ts`).
