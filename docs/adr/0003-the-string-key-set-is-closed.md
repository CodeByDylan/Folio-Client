# 3. The string key set is closed

Status: accepted
Date: 2026-08-12

## Context

`Translate` took any `string` and returned the key itself when nothing named it. Nothing
connected a `t(…)` call to the defaults it depended on, so a missing string was invisible
until someone looked at the page.

Four had already shipped that way. `projects.$slug.tsx` asked for `` t(`status_${status}`) ``
and no `status_*` key existed in the defaults or anywhere else, so every Project with a
status rendered the literal text `status_active` next to its status dot — twice, since the
expression was evaluated for both the dot's label and the text beside it.

Three defaults had drifted the other way and were asked for by nobody: `home`,
`featured_work`, `updated`.

## Decision

`StringKey` is `keyof typeof defaultStrings`, and `Translate` accepts only that. A key with
no default does not compile.

Where the wire opens a family of keys, the family gets a method rather than a template
literal at the call site:

- `t.status(status)` and `t.skill(level)` — closed by the wire's own enums, so their
  defaults are checked like any other key.
- `t.locale(code)` and `t.link(link)` — genuinely open, so they fall back to the bare
  locale code and the link's URL rather than to a key name.

`defaultStrings` therefore has to be `as const satisfies Record<string, string>`, not
`Readonly<Record<string, string>>`, which would collapse `keyof` back to `string`.

## Consequences

- The four missing status strings had to be written before the build passed.
- The three dead defaults were removed, and a future one is visible.
- A typo in a key is a compile error rather than a rendered key name.
- Copy for a new section type cannot be forgotten: the renderer will not compile until its
  strings exist.
- `t` still returns the key as a last resort at runtime. That rung is now unreachable
  through the type, and the test that covers it has to cast to get there.
