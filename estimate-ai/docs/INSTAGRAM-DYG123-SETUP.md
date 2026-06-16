# Connecting the DYG123 Instagram assistant

This wires your Instagram AI (**DYG123**) up to **receive DMs and comments** and
reply automatically using the same Claude model the app already uses for
estimates.

> **Why a "connect" button isn't enough.** Instagram does not expose DMs or
> comments through simple connectors (e.g. IFTTT only sees *your own new
> posts*). Reading and replying to DMs/comments requires Meta's official
> **Instagram Messaging API** with a webhook — which is what this integration
> implements.

## What you need first

1. An Instagram **Professional** account (Business or Creator). Convert in the
   Instagram app: Settings → Account type and tools → Switch to professional.
2. A **Facebook Page** linked to that Instagram account.
3. A **Meta developer app**: https://developers.facebook.com/apps/ → Create app
   → add the **Instagram** product.

## How the code is structured

| File | Role |
| --- | --- |
| `app/api/webhook/instagram/route.ts` | Receives Meta's verification handshake (GET) and DM/comment events (POST). |
| `lib/instagram.ts` | Verifies webhook signatures and sends replies via the Graph API. |
| `lib/ig-assistant.ts` | The DYG123 "brain" — turns an inbound message into a reply with Claude. |

## Setup steps

1. **Fill in environment variables** (see `.env.example` → the *Instagram*
   section). In `.env.local` for local dev, and in the Netlify dashboard for
   production:
   - `IG_APP_SECRET` — App settings → Basic → App Secret.
   - `IG_VERIFY_TOKEN` — any string you invent (e.g. `dyg123-verify-9f2a`).
   - `IG_ACCESS_TOKEN` — a long-lived Instagram/Page access token with the
     `instagram_business_manage_messages` and
     `instagram_business_manage_comments` permissions.
   - (optional) `IG_ASSISTANT_NAME`, `IG_BUSINESS_NAME` to tune the persona.

2. **Deploy** so the webhook URL is publicly reachable. The endpoint is:
   ```
   https://<your-domain>/api/webhook/instagram
   ```
   For local testing, expose `localhost:3000` with a tunnel (e.g. ngrok) and
   use that HTTPS URL.

3. **Register the webhook in Meta.** In your app → Instagram → API setup /
   Webhooks:
   - Callback URL: `https://<your-domain>/api/webhook/instagram`
   - Verify token: the exact value you set for `IG_VERIFY_TOKEN`
   - Click **Verify and save** (Meta calls the GET route; it echoes the
     challenge).
   - **Subscribe** to the `messages` and `comments` fields.

4. **Grant the permissions** and connect the Instagram account to the app under
   Instagram → API setup. During development the app works for accounts with a
   role on it; to serve the public you'll submit
   `instagram_business_manage_messages` / `..._manage_comments` for **App
   Review**.

## Testing

- **DM:** send a DM to the connected Instagram account from another account.
  DYG123 should reply within a few seconds.
- **Comment:** comment on one of the account's posts; DYG123 posts a short
  public reply.
- Watch your server logs for `IG DM handling error` / `IG comment handling
  error` if a reply doesn't appear — they include the Graph API response.

## Notes & guardrails

- The webhook rejects any POST whose `X-Hub-Signature-256` doesn't match
  `IG_APP_SECRET`, so only Meta can trigger replies.
- The assistant is instructed not to invent prices or make promises, to keep
  comment replies to one short sentence, and to point pricing questions at the
  estimator (`NEXT_PUBLIC_APP_URL`).
- Echoes of the account's own messages and its own comments are ignored to
  avoid reply loops.
