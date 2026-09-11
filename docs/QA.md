# Quality report

Prepared September 8, 2026. This report distinguishes observed checks from future acceptance criteria. It is not a production security audit, accessibility certification, usability study, or employment-outcome validation.

## Observed checks

| Check | Result | Scope |
|---|---|---|
| JavaScript syntax | Pass | app, interpreter, data, optional visual module via Node syntax checking |
| Node tests | **78 passed, 0 failed** | 29 exercise fixtures, all eight deliberate bugs, interpreter behavior/limits, source mapping, snapshots, retrieval, curriculum links |
| Browser interaction smoke checks | **25 passed** | Offline Chromium render and interactions using the built single-file HTML |
| Responsive smoke checks | Pass within the browser suite | All seven routes at 390px and 760px; no document-level horizontal overflow |
| Desktop / mobile inspection | Performed | Dashboard and lab screenshots, mobile dashboard; adjusted line numbers, spacing, state labels, and controls |
| Static build | Pass | `dist/` plus a self-contained HTML preview of the same app source |
| Local HTTP spot checks | Pass | `/` returned HTML; `/src/app.mjs` returned JavaScript; `/.git/config`, `/package.json`, `/src/../.env` returned 404 |
| Provider / CDN credentials | None configured | No paid API activated, no keys collected, no deployment created |
| Remote GitHub / CI | Not run | The connected actions did not support creating a new repository; CI configuration is included but has not run on GitHub |

The 25 browser checks cover dashboard state; beginner-first lesson selection and timer; source-linked stepping; final output; public tests and one-time XP; bug detection; edited-source execution; line reordering; lesson dialogs and Escape; keyboard search; all curriculum stages; keyword evidence and unsupported-query abstention; capacity calculations; row filtering; reading links; typed explanation and rubric; escaped names; reduced motion; serialized-state round-trip; export; reset; narrow-screen routes; and absence of uncaught application errors.

## Browser-test environment limitation

This preparation environment blocks browser navigation, including localhost and file URLs. The tests therefore use Playwright `set_content` with the actual generated single-file app. This tests the rendered interface and application logic without external networking.

An explicit in-memory Storage test double verifies serialized progress round-trip, validation, and UI restoration. It does **not** establish native localStorage persistence across real browsing origins, Safari behavior, privacy modes, device restarts, or cross-device synchronization. Local storage is implemented, but those native-environment checks remain a release task. The server itself was exercised through ordinary localhost HTTP requests separately.

A real browser download event was observed for progress export. Test-generated explanation text was not incorporated into public learning content. Screenshots show generated test state, not real user achievement.

## Not verified live

- CDN availability or execution of the pinned Three.js and Anime.js imports; the source implements them, but external networking is unavailable here. SVG and text are the tested default. Verify exact distribution paths, versions, licenses, rendering, cleanup, and error behavior before release.
- Real microphone capture, browser-vendor speech recognition, device voices, audio cancellation timing, or multilingual recognition. The typed path and consent/UI logic are included; no successful live voice conversation is claimed.
- Authenticated accounts, cross-user authorization, production databases, real Python/Java/SQL execution, payment processing, provider APIs, or cloud deployment. These are not implemented.
- Hosted CSP behavior in the browser, full browser-engine matrix, native iOS interaction, screen-reader usability, 200% zoom, formal color-contrast/touch-target audit, or comprehensive accessibility compliance.
- Adversarial multi-tenant security, complete fuzzing, load testing, sustained memory use, production reliability, or measured learning effectiveness.

## Reproduce

```bash
npm run check
npm test
npm run build
python tests/browser_smoke.py
```

The browser script requires Python Playwright and Chromium. Set `CHROMIUM` to another installed browser executable and `TRACECRAFT_ARTIFACTS` to a desired output directory. Python/browser dependencies are test tools, not requirements to start the app.

The build has no npm package dependencies. Node 22 is the tested runtime. Browser tests use a prepared environment and do not provision paid services.

## Release checks still required

Run from a normal localhost/HTTPS origin in supported browsers. Verify native storage, microphone consent/revocation, stop/abort behavior, download behavior, and offline/library failure states. Inspect every route at multiple text sizes with keyboard and screen reader. Recheck library versions and provider terms. Validate any new runtime against its real language semantics. Set and test authorization, quotas, retention, deletion, cost limits, and runner isolation before public multi-user use.

Passing the alpha tests is useful evidence about this starter implementation. It is not a reason to skip those production checks.
