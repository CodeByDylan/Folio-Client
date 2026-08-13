# 1. Provenance believes the fallback flag

Status: accepted
Date: 2026-08-12

## Context

The provenance sidecar is sparse: the API emits an entry only for a field it could not
serve in the locale that was asked for. `isFallback` therefore used to answer on key
presence alone and never read `ProvenanceEntry.fallback`, even though the published schema
carries that boolean.

The two disagreed. An entry with `fallback: false` reported `true`.

Presence-as-truth is only correct while the API never emits a non-fallback entry. That is
not something the contract promises, and nothing here would notice if it changed — the
client would quietly mark correctly-localised copy as "shown in English".

## Decision

`isFallback` reads the flag: an entry must exist **and** say `fallback: true`.

While the sidecar stays sparse this is indistinguishable from the old behaviour, so the
change costs nothing today and holds if the API starts emitting fuller entries.

## Consequences

- The schema and the client now mean the same thing by "fallback".
- A sparser or fuller sidecar both read correctly.
- Callers ask a scoped `Provenance` about a field and never construct a JSON pointer, so
  the wire format stays inside the module.
