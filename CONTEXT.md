# Domain language

The terms this client uses for what the Folio API serves. Use these names in code,
comments and commit messages; if a concept here needs a new name, change it here first.

## Content

**Site** — everything true of the portfolio as a whole: its locale and the locales it
offers, its title and tagline, its `Strings`, its links, and the `Page` list. Loaded once
by the shell route and read by every page beneath it.

**Page** — one addressable document, named by a slug. Exactly one Page is the *home* Page
and is served at `/`; every other Page hangs off its slug. A Page is a list of `Section`s.

**Section** — one block of a Page, discriminated by `type`. Six types are known — `prose`,
`hero`, `skills`, `qa`, `contact`, `projects` — and each has a schema and a renderer. A
seventh, `unknown`, is what a type this client predates degrades into, so one unrecognised
Section cannot cost the whole Page.

**Project** — one piece of work, with its own sections, tags, links, relations and
repository `metadata`. **ProjectSummary** is the smaller shape the index serves.

**Strings** — the Site's translated copy, keyed by string id. Read through `Translate`,
never directly.

## Presentation

**Translate** — the one way to read copy. Its key set is closed: `StringKey` is derived
from the built-in defaults, so asking for a string nobody wrote does not compile. The four
families the wire opens — `status`, `skill`, `locale`, `link` — are methods on it rather
than keys built at the call site, and each falls back to something readable.

**Navigation** — where a visitor can go from here and which of those places they are
already in. Built once per render from the Site, the Project index and the current path;
the shell and the footer both ask it rather than comparing paths themselves. A Project's
own page counts as being inside the projects section.

**Routing** — every fact about a path: how one is built, how one normalises for comparison,
and whether a URL stays on this Site. Navigation, the link adapter and the Hero Section all
ask it rather than testing prefixes themselves.

## Serving

**Folio** — the module that performs every read of the portfolio. It resolves the locale,
retries once when a stored choice is refused, and hands back a `Resolved`.

**Resolved** — a value together with whether the locale the visitor asked for was refused.
`localeRejected` is what raises the banner in the shell.

**LocaleStore** — where a visitor's locale choice is read from and forgotten. Cookies and
the `accept-language` header in production; a plain object in tests.

**FolioFailure** — how a read failed: `invalid`, `unauthorized`, `not-found`,
`unavailable`, `unexpected`, `transport` or `contract`. A route turns `not-found` and
`invalid` into a router not-found; everything else reaches the error boundary.

**Provenance** — a sparse sidecar saying which locale each field actually came from. Scoped
rather than addressed: ask a `Provenance` for a Section and it answers about that Section's
fields. Callers never build a JSON pointer.

**Draft** — what the contact form holds while it is being filled in, before anything is
validated. Derived from the `message` schema, so the field list is written once.

**Delivery** — the outcome of the contact form: `sent`, `rejected`, `unconfigured` or
`failed`. A post that is not same-origin is `rejected`, including one whose `Origin` header
will not parse.

**Deliver** — the act of handing a filled-in form somewhere, as a dependency the Contact
Section accepts rather than creates. The server function in production, a stub in tests.
This is what keeps the render path free of server code.
