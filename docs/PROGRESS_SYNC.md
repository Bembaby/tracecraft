# Verified accounts and reviewed progress sync

TraceCraft is an alpha with local practice and optional accounts. The hosted edition uses Vercel Functions, Better Auth, Neon Postgres and Resend. Email codes verify inbox access. They do not certify legal identity or skill. The older local GitHub/SQLite adapter remains available separately.

## Hosted setup

Use Node 24 on Vercel and run `npm ci` from the lockfile. The linked project builds `dist/` with `npm run build` and bundles `api/index.mjs` as a Node function. The function never executes learner programs. `vercel.json` routes `/api/*` to it and applies browser security headers. Plain `npm start` serves local mode; it does not emulate the hosted function.

Configure these server-only variables in the intended Vercel environment:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection; provision through the Marketplace |
| `DATABASE_URL_UNPOOLED` | Optional direct connection for explicit migrations |
| `AUTH_URL` | Exact public HTTPS origin, no trailing slash |
| `AUTH_SECRET` | Random secret of at least 32 characters; use a Secret variable |
| `RESEND_API_KEY` | Sending-only key restricted to the verified sending domain; use a Secret variable |
| `EMAIL_FROM` | Sender on that verified domain |

Use an ignored `.env.local` for operator commands. Never paste credentials into browser source, progress files, shell arguments or logs. Incomplete hosted configuration fails closed. Production uses its own exact origin; an unconfigured preview must not borrow production credentials or send users to another environment.

Before deployment, run the explicit schema operation:

```bash
npm run db:migrate
node --env-file=.env.local scripts/verify-postgres.mjs
```

Migration creates the Better Auth tables plus `tc_progress` and `tc_email_limits`. It runs outside request handling and rejects unexpected schema changes for review. The optional verification script creates disposable synthetic identities, verifies real auth/database operations and cleans its own records. It sends no email. It is not part of `npm test` and requires an intentional database target.

Connect the web domain and verify the separate sending subdomain with DKIM and SPF records from Resend. Publish DMARC and inspect its policy as delivery matures. This deployment starts at `p=none`; tracking is disabled and sending TLS is enforced. Receiving email is not enabled. Domain registration and provider upgrades require explicit user approval. The initial deployment uses the Neon free plan and caps requested codes below the existing Resend daily allowance.

## Identity and account access

1. Request a six-digit code in **Account & sync**.
2. Enter it in the browser. The newest code expires after five minutes and works once. Three wrong guesses invalidate it.
3. The server verifies the code and creates a verified account/session. Unverified accounts cannot access progress.
4. Choose **Review sync** before saving or restoring work.

Passwords and OAuth are disabled in the hosted flow. The public auth gateway permits only code send, code sign-in and sign-out. It strips session tokens from JSON. Better Auth transports the opaque session through an HttpOnly cookie, Secure on HTTPS, with a seven-day lifetime. Browser progress and exports contain no credentials, codes or session tokens. Codes are hashed in the auth database. Sign-in email/code form state is memory-only and is cleared on route departure.

Mutations require the exact configured Origin and `X-TraceCraft-Sync: 1`. Account responses use `no-store`. Owner identity always comes from the validated session; URL or JSON owner fields cannot select another account. Better Auth rate limits code requests per IP and verification attempts. Atomic database counters also cap sending at three messages per address per UTC hour and fifty per UTC day for this alpha. Transient delivery retries use the same idempotency key and stop after two attempts. No code or email address is written to application error logs.

## Records, limits and conflicts

Auth tables hold account email, verified status, expiring sessions and verification records. `tc_progress` contains one owner-scoped, revisioned JSON snapshot. Its user foreign key cascades on deletion. The snapshot keeps three existing workspaces separate:

- Training: SQL/Python drafts, checked code snapshots, assistance, explanations, review schedule, journal, paused timer, milestone self-checks and evidence notes.
- System design: graphs, settings, explanations, help levels and bounded checked graph snapshots.
- Original tools: visual-lab drafts, practice records, interview text and preferences.

Attempts retain content/runtime versions. Historical imported attempts remain `historical-unversioned`. Retention remains the latest 500 training checks and 100 design checks. SQL database bytes, Python memory and session undo/redo stacks are excluded. Everything is client-authored practice evidence, not trusted grading.

Hosted account requests/snapshots are bounded to 4 MB to fit the function request limit. Complete local backups retain the 16 MB contract; legacy importers keep their own documented limits. Export older histories when a hosted snapshot becomes too large. The complete local backup does not need an account.

Sync is explicit. Sign-in and ordinary practice do not upload drafts. Saving replaces the whole account copy only if its reviewed revision is still current. The INSERT or UPDATE compares ownership and revision in the same database operation. A concurrent stale save gets HTTP 409 and requires another review. There is no automatic merge or background upload.

Restoring rechecks the account revision and refuses if local work changed after review. It first keeps one validated local recovery copy, rolls back partial storage writes on error and reloads other tabs after success. If recovery cannot fit, replacement does not start. Export both copies before replacing them if they each contain useful work. Counts cannot identify identical text.

## Privacy, shared devices and deletion

Signing in shares an email address with the account service and its delivery provider. Saving shares the reviewed code, diagrams and personal notes with the hosted account database. Do not put production secrets or private customer data in practice work. No analytics or marketing mailing list is installed. Provider operational logs and database backups have their own retention; this alpha makes no guaranteed backup retention or forensic erasure claim.

Signing out revokes the active session but keeps the local workspace. The next visitor to a shared browser can see that browser copy. Account switching never uploads it automatically. Export what you need, then clear this origin's site data yourself to remove all browser stores and recovery copies. The original Settings reset affects original tools only.

**Delete account data** requires typing DELETE and removes the active account, progress and all sessions through database cascades. Other devices must verify again. Browser copies, downloaded exports, provider delivery history and operator backups are separate. Account deletion is not a provider-log purge.

## Legacy local GitHub adapter

This retained adapter uses `scripts/serve.mjs`, not the hosted function. Register your own GitHub OAuth app, set its callback to the exact local origin plus `/api/auth/github/callback`, and configure `TRACECRAFT_ORIGIN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and optional `TRACECRAFT_DB`. Use Node 22.13 or newer:

```bash
node --env-file=.env scripts/serve.mjs
```

The default private SQLite path is `.tracecraft/progress.sqlite`. Hosted use of this adapter would require a persistent private volume and a single service instance. Do not use Vercel's ephemeral filesystem for SQLite. The adapter preserves PKCE, single-use browser-bound state, hashed sessions, owner-scoped writes and the 16 MB local API limit. Live GitHub consent is separate from the verified email deployment and is not claimed as tested here.

## Provider references

Reviewed October 28, 2026: [Better Auth email OTP](https://www.better-auth.com/docs/plugins/email-otp), [Vercel Functions](https://vercel.com/docs/functions), [Vercel request limits](https://vercel.com/docs/functions/limitations), [Neon plans](https://neon.com/pricing), [Resend test addresses](https://resend.com/docs/dashboard/emails/send-test-emails), [Resend terms](https://resend.com/legal/terms-of-service) and [Vercel terms](https://vercel.com/legal/terms). Pinned packages retain their MIT/Apache notices. Provider limits and terms may change; verify before increasing quotas or enabling charges. See [QA.md](QA.md) for observed coverage and remaining limits.
