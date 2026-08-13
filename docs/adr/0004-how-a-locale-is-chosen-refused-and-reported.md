# 4. How a locale is chosen, refused and reported

Status: accepted
Date: 2026-08-13

## Context

Locale is the one concept that spans the codebase — the `LocaleStore` seam, the
negotiation in `locale.ts`, the retry tree in `folio.ts`, the cookie in `server.ts`, the
banner in the shell, the selector, the i18n provider, the string chain and the provenance
sidecar. Each split is deliberate, but no single place said how the pieces fit, and one
piece was wrong: any 400 was read as "the locale was refused", so a visitor who followed
a bad link had their stored language deleted.

## Decision

**Choosing.** The stored cookie (`folio.locale`) wins. Failing that, the first well-formed
`accept-language` tag. Failing that, no locale is sent and the API serves its default.

**Refusing.** A 400 on a request that carried a locale *might* mean the locale was
refused — but 400 covers any bad request. Folio retries once without the locale, and only
a retry that succeeds proves the locale was the problem. If the retry fails too, the
original failure propagates and the stored choice is kept. The second round-trip is the
price of not guessing.

**Reporting.** A refused *stored* choice is forgotten (the cookie is deleted) and
surfaced as `Resolved.localeRejected`, which the shell shows as a dismissable banner. A
refused *negotiated* locale is ordinary and silent — the visitor never chose it.

**Per-field origin.** `Provenance` answers whether one field fell back to another locale
(ADR-0001); `FallbackNotice` renders the answer. This is independent of the whole-response
refusal above.

**The document.** `<html lang>` is set from the same cookie/header signal before the Site
loads. The Site's own `locale` then drives the i18n provider. The two can disagree for one
render when the API refuses the request locale; that render also carries the banner.

## Consequences

- A bad slug no longer costs the visitor their stored language.
- `t.locale(code)` falls back to the bare code, casing intact (ADR-0003) — `pt-BR` stays
  `pt-BR`, because the code is itself meaningful copy.
- Anyone tracing locale behaviour starts here; the modules stay as small as they are.
