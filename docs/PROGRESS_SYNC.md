# Optional GitHub sign-in and progress sync

This alpha adds an opt-in Node account API and a durable SQLite file. Local practice still works without an account, configuration, or npm dependencies. The existing static Site does not gain an API merely by receiving these browser files. This source change does not provision or deploy a service.

## Run the account server

Use Node.js 22.13 or later. Node 24.15 was used for local verification. The account store uses the built-in `node:sqlite` API, which can print an experimental warning on supported older Node releases. There are no new third-party dependencies or licenses.

1. Register a GitHub OAuth app under an account you control. Set its callback URL to `http://127.0.0.1:3000/api/auth/github/callback` for local development, or your exact HTTPS origin followed by `/api/auth/github/callback` for hosting. Use separate OAuth apps for local and hosted environments.
2. Copy `.env.example` to an ignored `.env`, fill the client ID and secret, and set `TRACECRAFT_ORIGIN` to the exact origin without a trailing slash. Keep the secret on the server. Do not paste it into the browser, source, progress JSON, or a support message.
3. Start with `node --env-file=.env scripts/serve.mjs`. To serve the directory build, add `--dist`. Plain `npm start` uses exported environment variables and does not automatically load `.env`.
4. Open **Progress sync**, choose **Continue with GitHub**, then **Review sync**. Choose which copy to save or restore. On another browser, use the same host and GitHub account to restore its saved copy.

With all three account environment variables absent, `npm start` serves local mode. Partial configuration fails at startup. HTTP is permitted only on loopback; a hosted account origin must use HTTPS. Do not enable charges or provision paid infrastructure without an explicit budget decision.

`TRACECRAFT_DB` defaults to `.tracecraft/progress.sqlite`. Mount a private durable volume there when hosting. A process restart preserves progress; an ephemeral deployment filesystem does not. Use one service instance and one durable SQLite volume for this alpha. Do not place the database or its backups in `src/`, `public/`, `dist/`, a shared static directory, or a public repository. The asset server rejects database file extensions and never serves the default private directory. Operators remain responsible for disk permissions, encrypted storage if required, backups, retention, and restore drills. SQLite writes here are metadata persistence, never learner-program execution.

## Identity and ownership

GitHub's authorization-code flow uses a random state, a separate browser-binding cookie, a server-held PKCE verifier, an S256 challenge, a ten-minute deadline, and single-use callback consumption. The server exchanges the code and reads the authenticated GitHub user. Identity is keyed by the immutable numeric GitHub user ID, not a mutable display name. No repository or email scope is requested.

The GitHub token is used only for the identity request and is not persisted or returned to JavaScript. App sessions are random opaque tokens with a seven-day absolute lifetime. Only their SHA-256 hashes are stored in SQLite. The browser transports the opaque session in an HttpOnly, SameSite=Lax cookie scoped to `/api`, with Secure enabled on HTTPS. JavaScript, localStorage, progress records, and backups contain no session tokens or provider credentials. Signing out revokes the current session; deleting account data revokes every session for that identity. This is not a browser password or API-key vault.

Every progress operation derives its owner from the validated session. Requests never select an owner through a URL, JSON field, or display name. Mutations require the configured Origin; account writes also require a custom same-origin header. Account responses use `no-store`. Cross-user access, expired sessions, state replay, absent headers, and foreign Origins are tested. This remains alpha account infrastructure, without a production security audit or public-service abuse/load qualification.

## Records and content versions

The `users`, `sessions`, `oauth`, and `progress` tables separate identity, expiring authorization state, and learner data. A progress record contains a monotonically increasing revision, server timestamp, and a version-1 `tracecraft-progress` snapshot with three separate workspaces:

- Training: drafts, checked-attempt code snapshots, in-app assistance events, explanations, review schedule, journal entries, self-reported completion, and paused timer.
- System design: graph drafts, settings, explanation notes, assistance level, and bounded checked graph snapshots.
- Original tools: visual-lab drafts, practice records, interview text, and preferences.

Training and design attempts now include `contentRevision` and `runtimeVersion`. Older imported attempts are labeled `historical-unversioned`; they are not retroactively attributed to a runtime. Existing retention bounds remain 500 training checks and 100 design checks. SQL database bytes, Python interpreter memory, and session undo/redo stacks are excluded. These records remain client-authored practice evidence, never trusted grading or hiring scores.

Only supported fields cross the account boundary. The server validates the snapshot again and bounds HTTP request bodies to 16 MB. Complete local backups have the same limit. Legacy workspace backup formats remain supported through their existing importers; use **Import complete backup** for the new all-workspace format.

## Conflicts, recovery, and shared devices

Sync is explicit, not automatic. Signing in, practicing, and opening the review do not upload drafts. **Save browser copy to account** replaces the complete account snapshot only if the reviewed revision is still current. SQLite performs the comparison and write in one transaction. A stale write returns HTTP 409 and asks for another review. There is no silent last-writer-wins behavior and no automatic field merge.

**Restore account copy** rechecks the remote revision and refuses if local work changed after review. It keeps one validated local recovery snapshot before replacement, rolls back partial writes on a storage error, then reloads the app. Other open tabs on that origin reload after a completed restore, preventing them from continuing with an older in-memory workspace. If quota prevents creating recovery, replacement does not start. If even rollback fails because storage has become unavailable, export the recovery copy before closing.

Export both copies before replacing them when each has work you need. Counts in the review help compare scope; they cannot tell whether two explanations or drafts contain the same text. Manually combine work using the exported JSON if necessary. Complete backups and recovery copies can themselves be imported with the same replacement review.

Signing out leaves the local browser copy available for offline practice. On a shared browser, the next visitor can see it. Account switching never automatically uploads that copy to another identity. To clear the complete browser copy, export it first, then import a deliberately empty complete backup through the replacement review or clear this origin's site data yourself. The original Settings reset affects original tools only. Recovery copies and downloads may still contain personal notes.

**Delete account data** requires typing DELETE and removes the saved snapshot, identity link, and all sessions. Other devices must sign in again. This does not revoke GitHub's OAuth-app grant, remove browser copies, purge downloads, or erase operator backups. Account deletion is logical deletion from the active database, not a forensic disk-erasure claim; operators must document backup retention.

## Evidence and remaining setup

Automated tests exercise the actual HTTP API with a mocked GitHub token/user exchange, two independent app sessions for one identity, a second identity, conflicts, durable reopen, export, logout, and deletion. Browser checks cover the real local-mode UI and complete backup round-trip, plus save/restore using a synthetic session against the actual local account API. These are separate from a live GitHub consent/callback verification, which requires an operator's registered OAuth app credentials. No live hosted-account success is claimed.

Reviewed October 28, 2026: [GitHub authorization-code and PKCE documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), [GitHub API terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms), and [Node SQLite API](https://nodejs.org/api/sqlite.html). Follow provider terms and rate limits. The GitHub name is used to identify the provider; no brand assets were copied. Existing vendored runtime versions and licenses are unchanged.
