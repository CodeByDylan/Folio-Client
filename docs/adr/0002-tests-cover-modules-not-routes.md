# 2. Tests cover modules, not routes

Status: accepted
Date: 2026-08-12

## Context

The test setup deliberately omits the TanStack Start plugin. Booting a router and a request
pipeline to assert on a decision is slow, brittle, and tests the framework more than this
code.

Taken literally, though, that had cost us the render path entirely: the include glob matched
`.test.ts` only and the environment was `node`, so a rendering test could not have been
collected even if one had been written.

Separately, `src/env.ts` read and validated the server environment at module load. Any test
that imported a module anywhere downstream of it — which includes every section renderer,
via the contact form's server function — failed on import with `Invalid environment`.

## Decision

Keep the Start plugin out. Test decisions where they live instead:

- Decisions belong in modules a plain node test can import. The locale retry tree, the
  request path, the section registry, the failure-to-not-found mapping and the string
  lookup chain are all reachable without a router.
- Rendering tests are allowed where the decision is genuinely about what appears on screen.
  They opt in per file with `// @vitest-environment jsdom` and import `#/test-dom` for
  cleanup, jest-dom matchers and a `matchMedia` stub.
- `env` is a function, read on first use. Importing a module must never demand a configured
  server.

## Consequences

- The request path, locale resolution and the string chain are covered; they were not.
- Route loaders remain uncovered end to end. The decisions inside them are not: they were
  moved into `requested` and the section registry, which are.
- A new section type fails to typecheck until both its schema and its renderer exist, so
  that pair needs no test to stay in step.
