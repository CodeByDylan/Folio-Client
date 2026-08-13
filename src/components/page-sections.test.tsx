import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Questions follows the URL hash; these tests render without a router.
vi.mock("@tanstack/react-router", () => ({
	useLocation: () => ({ hash: "" }),
}));

import type { Deliver } from "#/api/message";
import { createProvenance } from "#/api/provenance";
import { type PageSection, zPage } from "#/api/sections";
import { PageSections } from "#/components/page-sections";
import { fallbackTranslator } from "#/lib/strings";

const sectionsOf = (...sections: ReadonlyArray<unknown>) =>
	zPage.parse({
		requestedLocale: "en",
		locale: "en",
		slug: "about",
		home: false,
		navLabel: null,
		sections,
		provenance: { "/sections/0/body": { locale: "en", fallback: true } },
	}).sections as ReadonlyArray<PageSection>;

const prose = (id: string, body: string | null) => ({
	id,
	type: "prose",
	source: "folio",
	body,
});

const unanswered = {
	id: "faq",
	type: "qa",
	questions: [{ id: "q1", question: "Why?", answer: null }],
};

function draw(
	sections: ReadonlyArray<PageSection>,
	send: Deliver = async () => "sent",
	provenance: Record<string, { locale: string; fallback: boolean }> = {
		"/sections/0/body": { locale: "en", fallback: true },
	},
) {
	return render(
		<PageSections
			sections={sections}
			projects={[]}
			provenance={createProvenance(provenance as never)}
			t={fallbackTranslator}
			send={send}
			empty={<p>nothing here</p>}
		/>,
	);
}

describe("rendering a page's sections", () => {
	it("draws each section that has something to show", () => {
		draw(sectionsOf(prose("a", "First"), prose("b", "Second")));

		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
	});

	// The section is invisible, so it must not leave a divider behind either.
	it("leaves out a section with nothing to show, dividers and all", () => {
		const { container } = draw(
			sectionsOf(prose("a", "First"), unanswered, prose("b", "Second")),
		);

		expect(screen.queryByText("Why?")).not.toBeInTheDocument();
		expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1);
	});

	it("draws one divider between each pair it keeps", () => {
		const { container } = draw(
			sectionsOf(
				prose("a", "First"),
				prose("b", "Second"),
				prose("c", "Third"),
			),
		);

		expect(container.querySelectorAll('[role="separator"]')).toHaveLength(2);
	});

	it("falls back to the empty node when nothing survives", () => {
		draw(sectionsOf(prose("a", null), unanswered));

		expect(screen.getByText("nothing here")).toBeInTheDocument();
	});

	it("draws nothing for a section type this client predates", () => {
		draw(sectionsOf({ id: "t", type: "timeline", entries: [] }));

		expect(screen.getByText("nothing here")).toBeInTheDocument();
	});

	it("marks copy the api served in another locale", () => {
		draw(sectionsOf(prose("a", "First")));

		expect(screen.getByText("Shown in English")).toBeInTheDocument();
	});

	// The pointer indexes the wire array, where the unanswered question still counts.
	it("addresses an answer by its wire position, not its shown position", async () => {
		const user = userEvent.setup();

		draw(
			sectionsOf({
				id: "faq",
				type: "qa",
				questions: [
					{ id: "q1", question: "Why?", answer: null },
					{ id: "q2", question: "How?", answer: "Like this." },
				],
			}),
			undefined,
			{ "/sections/0/questions/1/answer": { locale: "en", fallback: true } },
		);

		await user.click(screen.getByText("How?"));

		expect(await screen.findByText("Shown in English")).toBeInTheDocument();
	});
});

const contact = { id: "reach", type: "contact", heading: "Say hello" };

// Astryx appends a "Required" hint to the label, so these match on the leading text.
const field = (label: string) => screen.getByLabelText(label, { exact: false });

const fill = async (
	user: ReturnType<typeof userEvent.setup>,
	email = "ada@example.com",
) => {
	await user.type(field("Name"), "Ada");
	await user.type(field("Email"), email);
	await user.type(field("Message"), "Hello there.");
	await user.click(screen.getByRole("button", { name: "Send message" }));
};

describe("the contact section", () => {
	it("hands a valid message to whatever it was given", async () => {
		const user = userEvent.setup();
		const send = vi.fn<Deliver>().mockResolvedValue("sent");

		draw(sectionsOf(contact), send);
		await fill(user);

		await waitFor(() => {
			expect(send).toHaveBeenCalledWith({
				name: "Ada",
				email: "ada@example.com",
				message: "Hello there.",
				company: "",
			});
		});
	});

	it("says so when the message went", async () => {
		const user = userEvent.setup();

		draw(sectionsOf(contact), async () => "sent");
		await fill(user);

		expect(
			await screen.findByText("Thanks — your message is on its way."),
		).toBeInTheDocument();
	});

	// Every outcome that is not "sent" reads the same to the visitor.
	it("says so when it did not", async () => {
		const user = userEvent.setup();

		draw(sectionsOf(contact), async () => "unconfigured");
		await fill(user);

		expect(
			await screen.findByText("That did not send. Try again in a moment."),
		).toBeInTheDocument();
	});

	it("does not send a message that fails its own schema", async () => {
		const user = userEvent.setup();
		const send = vi.fn<Deliver>().mockResolvedValue("sent");

		draw(sectionsOf(contact), send);
		await fill(user, "not-an-email");

		expect(send).not.toHaveBeenCalled();
	});

	// A stale "on its way" above a red unsent field would be a lie.
	it("withdraws the success banner when a later submit fails validation", async () => {
		const user = userEvent.setup();

		draw(sectionsOf(contact), async () => "sent");
		await fill(user);
		await screen.findByText("Thanks — your message is on its way.");

		await fill(user, "not-an-email");

		expect(
			screen.queryByText("Thanks — your message is on its way."),
		).not.toBeInTheDocument();
	});
});
