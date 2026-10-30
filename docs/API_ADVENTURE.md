# API adventure

October 29, 2026. Start at [the live API adventure](https://tracecraft.dev/#apis) after verified email sign-in. This is an original beginner learning path in the existing arcade world. Its purpose is to build useful vocabulary, message-reading confidence and debugging habits, then lead into real local projects. Practice records are not a certification or an interview guarantee.

## Start from zero

Choose HTTP from zero, then REST and resource APIs. A lesson has six freely selectable steps: learn one idea, predict an example, choose a claim, fill a missing word or code piece, find a mistake, and explain the idea. Worked answers disclose that they are authored examples. The model labs compute a fresh result from the supplied inputs. Nothing is locked and the whole-lesson view remains available.

Each of the 46 lessons includes original teaching, an objective, two terms, a worked message/result/explanation, a pitfall, a follow-up, primary references and three recognition questions. Each question has an exact input contract, edge fixtures, a deliberate wrong answer, a canonical solution and a bounded-comparison cost justification. Automated authoring checks verify all 138 questions and 46 blank slots. Independent answer keys and model invariants test behavior separately from the content's own expected fields.

| Track | Lessons | Progression |
|---|---:|---|
| HTTP from zero | 5 | Client/server, message parts, status, JSON, safe browser boundaries |
| REST and resource APIs | 9 | Resources, architectural constraints, methods, replacement/patch, retries, errors, authorization, cache/conditional requests, pagination/contracts |
| SOAP and service contracts | 4 | XML envelope, WSDL/schema, faults, compatible service boundaries |
| RPC and gRPC | 5 | Typed calls/stubs, message patterns, deadlines/cancellation, protobuf evolution, browser/deployment tradeoffs |
| GraphQL | 5 | Schema/selections, nullability, variables/operations, partial errors, resolver cost |
| Webhooks | 5 | Callback direction, verification, retries/deduplication, ordering/gaps, durable acceptance |
| WebSockets | 5 | Open/send lifecycle, authentication, recovery/replay, pending-message limits, choosing connection state |
| WebRTC | 5 | Signaling, ICE, TURN, capture/data distinctions, SFU topology |
| SSE and choosing a pattern | 3 | One-way event feeds, retained replay, choosing a communication family |

The daily review contains at most five authored recall questions and adds no new XP. First-correct lesson recognition answers earn 10 practice XP once, including assistance records when a hint or correction was used. The shared arcade HUD includes those records and quick-quest records. A level represents six first-correct questions. Notes, read marks and model predictions do not create recognition XP. Model attempts can establish a day of checked practice. The track checkpoint separates explaining an idea, changing a model input and building/testing a real project, all explicitly self-assessed.

## What the linked video contributes

The source is Codist's [Every Type of API Simply Explained in 9 Minutes!](https://www.youtube.com/watch?v=pBASqUbZgkY), duration 9:53. Analysis used the complete timestamped captions plus selected chapter visuals in the browser, including the query and network-path diagrams. It was not an uninterrupted visual playback audit. The automated full-video visual-analysis request did not complete because its credit requirement exceeded the available balance. No transcript text, video art or proprietary problem was copied into this course.

The video offers a useful family map: REST at 0:00, SOAP at 1:26, RPC/gRPC at 2:53, GraphQL at 4:35, webhooks at 6:11, WebSockets at 7:34, and WebRTC at 8:30. The course supplies the HTTP foundations that a fast overview cannot establish and adds SSE as a useful adjacent comparison. Chapter links are context, not prerequisites or endorsements of every simplification.

Several distinctions need more care when implementing an API:

- REST describes architectural constraints, including client/server separation, stateless requests, caching, a uniform interface and layering. It is broader than JSON CRUD. Statelessness does not prohibit persistent resource state. REST is not inherently unsuitable for financial applications. See [Fielding's REST chapter](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) and [HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html).
- SOAP defines a messaging framework. Delivery, identity, transactions and security depend on additional mechanisms and implementation; an envelope does not guarantee exactly-once business effects. Fault structure and mandatory headers matter. See [SOAP 1.2](https://www.w3.org/TR/soap12-part1/).
- gRPC exposes several message patterns and caller deadlines. Protobuf is a serialization format, not a universal compression or fixed speedup guarantee. Field-number compatibility and deployment constraints matter more than a blanket performance multiplier. See [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/) and [protobuf encoding](https://protobuf.dev/programming-guides/encoding/).
- GraphQL can return useful data with field errors. A schema-validated selection still needs authorization, resolver cost controls and sound transport choices. GitHub also offers a REST API. See [GraphQL response rules](https://graphql.org/learn/response/) and [GitHub's REST introduction](https://docs.github.com/en/rest/about-the-rest-api/about-the-rest-api).
- Webhook delivery can be retried, duplicated or out of order. Real verification needs the provider's documented signature procedure and raw-body handling; a durable acceptance boundary and idempotent business operation remain separate concerns. See [Stripe's webhook documentation](https://docs.stripe.com/webhooks).
- WebSockets provide a live bidirectional channel, not indefinite availability or durable application replay. Reconnect, application acknowledgement, authentication and buffer limits require deliberate behavior. See [MDN's WebSockets guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).
- WebRTC needs signaling outside its peer API and can require TURN or media forwarding infrastructure. A connection diagram is not a server-free or privacy guarantee. Data channels and media capture have different permission needs. See [peer connections](https://webrtc.org/getting-started/peer-connections), [TURN](https://webrtc.org/getting-started/turn-server), and [WebRTC protocols](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols).
- SSE offers a one-way server event stream. Event IDs assist recovery only when the application retains enough history; a gap needs a separate resync policy. See [MDN's SSE guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

## Practice boundaries

Eight labs are deterministic browser models. HTTP and REST share a stateful notebook request model; the other families have dedicated models. Guided controls and optional bounded JSON accept only allowlisted synthetic fields. No API key, cookie, password or arbitrary endpoint is accepted. Results, generated messages, trace steps and optional route diagrams derive from current input. Changing an input invalidates the displayed result. Invalid input blocks a new run and preserves the last valid saved draft separately.

The notebook models owner-scoped reads and writes, required JSON fields, pagination, ETags, conditional reads/writes and retry IDs. Its world resets when leaving or resetting the lab. SOAP emits generated XML for a fixed operation. The gRPC model uses supplied message/timing assumptions, not a live channel or benchmark. GraphQL models a fixed field selection, not an arbitrary query parser. Webhook verification is a supplied synthetic verdict, not performed cryptography. Socket/SSE models do not open persistent connections. WebRTC chooses a route from supplied assumptions without requesting device permissions.

One separate button makes an actual read-only, same-origin GET /api/health with a timeout and bounded response. It displays the actual status, content type and response body. It does not send a request to an external API or expose cookies. Each track ends with an original real-project brief to implement and test outside the teaching model. These are the next step toward practical comfort; the model itself does not verify a production integration.

## Progress and verification

The optional apis object lives in the existing validated training snapshot. It stores track/lesson position, stages, bounded private explanations, read marks, canonical versioned answers, assistance, bounded model drafts/attempts, daily review and track-specific self-assessments. Old snapshots default safely. Unknown fields and credential-shaped input are rejected or stripped at the relevant boundary. The same validator is used for complete backups and owner-scoped account snapshots. Auth remains the existing expiring email-code flow with server sessions and reviewed save/restore.

See [phone review cycles](API_PHONE_ROUNDS.md) and [QA](QA.md) for the actual verification record. Tests distinguish recognition, model evaluation, actual network inspection, real language execution and self-assessment. Physical-phone and assistive-technology testing remain separate from browser viewport simulation.
