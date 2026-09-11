# Security boundaries

This is a local-first learning alpha, not an audited multi-tenant execution service.

Mini-Python parses an allowlisted, bounded teaching language. It does not call eval, spawn an interpreter, or intentionally expose filesystem/network APIs. Input, collection size, trace count, and expression work are bounded. Nested lists are rejected to prevent exponential snapshot amplification. These controls reduce obvious prototype risks; they are not a formal sandbox proof.

The browser still executes application JavaScript, and optional CDN code is executable third-party code. Review and self-host vetted dependency builds for production, retain license notices, pin integrity/artifact hashes, and enforce appropriate CSP. Client code is inspectable and cannot protect hidden tests or enforce paid quotas.

Never add general code execution to scripts/serve.mjs. A production runner belongs in an independently isolated, resource-limited environment without application credentials or broad network access. See docs/ARCHITECTURE.md.

Local storage can be read by code running on the same origin and is not a secure credential vault. Do not enter sensitive material into explanations. Browser speech recognition may use an external service.

Do not post an exploit containing credentials or private information in a public issue. After the repository exists, its maintainer should enable a private vulnerability-reporting channel and publish a disclosure policy. No monitored security contact or response-time promise is established by this package.
