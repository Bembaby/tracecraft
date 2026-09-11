# Voice, subscriptions, and provider connections

Status: **design specification plus optional browser speech in the alpha**. No paid provider has been connected, no API credentials collected, and no usage charges enabled. Reviewed September 8, 2026; verify again before implementation.

## What “connect my subscription” can legitimately mean

The product should make connection methods explicit, not imply every consumer subscription can be used by arbitrary websites. Use documented APIs, provider-approved OAuth/authorization, or an eligible official entitlement. Do not ask users for session cookies, account passwords, browser tokens, or workarounds to product restrictions.

| Provider or mode | Supported product direction | Important distinction | Alpha status |
|---|---|---|---|
| Browser speech | User-initiated text-to-speech and optional dictation | Browser/device support varies; recognition may use a remote speech service | Implemented, with consent and typing fallback; real audio not verified in this environment |
| OpenAI API | Realtime spoken tutor, or separate transcription/text/speech pipeline | ChatGPT and API billing are separate | Planned |
| Anthropic API | Text reasoning and lesson feedback combined with an approved speech layer | Claude subscription access does not automatically include API/Console use | Planned |
| Gemini API / Live | Approved API access with explicit project billing and short-lived session credentials where supported | AI Studio subscription benefits are not a universal external-app entitlement; eligible Cloud credits may apply separately | Planned |
| Other documented providers | Capability-based adapters, clear billing, provider-specific authentication | An API-compatible shape does not make terms or capabilities identical | Planned |
| Local models | A trusted local companion/runtime with explicitly configured access | No consumer subscription needed, but device resources, installation, and latency matter | Planned |

OpenAI’s billing guidance explicitly distinguishes the ChatGPT product from the API. The realtime WebRTC documentation describes a backend-authenticated setup with short-lived client credentials rather than exposing a long-lived server API key. [OpenAI billing](https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform) · [Realtime WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc).

Anthropic’s support guidance distinguishes paid Claude plans from the API and Console. First-party subscription features should not be repackaged as unrestricted third-party API access. [Claude subscription/API guidance](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console).

Google’s August 2026 documentation says AI Pro/Ultra benefits apply in the AI Studio web interface; direct API use by external applications is billed and managed separately. It also describes eligibility for certain Cloud credits, so “no subscription can ever provide any API-related benefit” would be too broad. Entitlements must be checked against the actual account, product, region, and current terms. [Google AI plans](https://ai.google.dev/gemini-api/docs/google-ai-plans) · [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing).

## Browser voice in this build

A learner may read the prompt aloud using the browser’s speech synthesis, or start speech recognition after a disclosure. Audio is not recorded to app storage. A resulting transcript is saved locally only after an explicit save action. The user can stop dictation or navigate away; navigation aborts recognition and cancels speech output.

Availability is feature-detected. Typing always works. The interface does not imply offline recognition or guarantee that audio remains on the device. Browser speech recognition can use an external recognition service; its privacy and availability depend on the implementation. This matters even when the app itself has no backend. [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) · [Web Speech specification](https://webaudio.github.io/web-speech-api/).

## Proposed provider adapter

```ts
interface TutorProvider {
  id: string;
  capabilities: {
    text: boolean;
    audioInput: boolean;
    audioOutput: boolean;
    realtime: boolean;
    toolCalls: boolean;
    shortLivedClientCredentials: boolean;
  };
  createSession(input: AuthorizedSessionRequest): Promise<SessionDescriptor>;
  cancelSession(sessionId: string): Promise<void>;
}
```

The server chooses a supported path. A text-only provider needs a separate approved speech layer rather than a fake “voice supported” label. The UI should show the connected account, capability, estimated cost range, budget, session expiry, and revoke action. Never imply that a connected chat plan funds an API session unless the provider explicitly says so for that integration.

## Credential and privacy requirements

Long-lived provider secrets stay on the server, encrypted through a managed secret/key service, not in localStorage, public Git, logs, analytics, or browser bundles. A bring-your-own-key mode needs a written retention/deletion policy and scope-limited handling. Prefer ephemeral client credentials for supported realtime protocols. A local-only experimental connection still needs a threat model; a browser secret is visible to scripts on its origin.

Microphone permission, provider transmission, transcript retention, and public sharing are separate consent decisions. Do not upload source code, personal documents, or recordings to a provider silently. Build mute, stop, delete, and revoke controls before public voice launch. Provide captions, keyboard operation, playback-rate controls, and text equivalents.

For explanation feedback, assess reasoning against a visible rubric: input clarification, state changes, invariant, edge case, complexity, and trade-offs. Do not judge accent, personality, confidence, identity, or employability from a voice. Explicitly disclose AI assistance and allow the learner to inspect and challenge feedback.

## Cost-control acceptance criteria

A session has a maximum duration, per-user budget, and global application budget. Enforce them server-side. Stop provider use when a budget is exhausted; do not silently switch to a more expensive model. Never advertise unlimited paid API voice without a substantiated commercial model. Provide a usage ledger and a cancellation path that actually tears down the session.

Measure a representative session before quoting costs. Voice input/output, text tokens, tool calls, storage, and compute can be billed differently. Prices and terms change; no numeric price in this document is a promise.
