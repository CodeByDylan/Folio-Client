import { describe, expect, it, vi } from "vitest";
import {
	deliver,
	type MailConfig,
	type Message,
	mailConfig,
	message,
	sameOrigin,
} from "./message";

const config: MailConfig = {
	key: "k",
	to: "to@example.com",
	from: "from@example.com",
};

const data: Message = {
	name: "Ada",
	email: "ada@example.com",
	message: "Hello",
};

describe("the message form", () => {
	it("accepts a filled-in message", () => {
		expect(message.safeParse(data).success).toBe(true);
	});

	it("refuses an address that is not one", () => {
		expect(message.safeParse({ ...data, email: "nope" }).success).toBe(false);
	});

	it("refuses a message that is only whitespace", () => {
		expect(message.safeParse({ ...data, message: "   " }).success).toBe(false);
	});

	// The handler judges the honeypot, so the schema has to let a filled one through.
	it("accepts a filled honeypot so the handler can see it", () => {
		expect(message.safeParse({ ...data, company: "bot" }).success).toBe(true);
	});
});

describe("mail settings", () => {
	it("is undefined until every field is present", () => {
		expect(
			mailConfig({ RESEND_API_KEY: "k", CONTACT_TO: "t" }),
		).toBeUndefined();
	});

	it("is complete once they all are", () => {
		expect(
			mailConfig({
				RESEND_API_KEY: "k",
				CONTACT_TO: "to@example.com",
				CONTACT_FROM: "from@example.com",
			}),
		).toEqual(config);
	});
});

describe("delivery", () => {
	const send = vi.fn().mockResolvedValue(true);

	it("sends a good message", async () => {
		const transport = vi.fn().mockResolvedValue(true);

		await expect(
			deliver(data, { sameOrigin: true, config, send: transport }),
		).resolves.toBe("sent");

		expect(transport).toHaveBeenCalledWith(data, config);
	});

	it("rejects a cross-origin post without sending", async () => {
		const transport = vi.fn();

		await expect(
			deliver(data, { sameOrigin: false, config, send: transport }),
		).resolves.toBe("rejected");

		expect(transport).not.toHaveBeenCalled();
	});

	it("tells a bot it succeeded, and sends nothing", async () => {
		const transport = vi.fn();

		await expect(
			deliver(
				{ ...data, company: "bot" },
				{ sameOrigin: true, config, send: transport },
			),
		).resolves.toBe("sent");

		expect(transport).not.toHaveBeenCalled();
	});

	it("says so when the mailbox is not configured", async () => {
		await expect(
			deliver(data, { sameOrigin: true, config: undefined, send }),
		).resolves.toBe("unconfigured");
	});

	it("fails when the provider refuses", async () => {
		await expect(
			deliver(data, {
				sameOrigin: true,
				config,
				send: vi.fn().mockResolvedValue(false),
			}),
		).resolves.toBe("failed");
	});

	it("fails when the provider is unreachable", async () => {
		await expect(
			deliver(data, {
				sameOrigin: true,
				config,
				send: vi.fn().mockRejectedValue(new Error("network")),
			}),
		).resolves.toBe("failed");
	});
});

describe("judging the origin of a post", () => {
	// A server function called during SSR carries no Origin, and that is not a browser post.
	it("accepts a request that carries no origin", () => {
		expect(sameOrigin(undefined, "folio.test")).toBe(true);
	});

	it("accepts an origin whose host matches", () => {
		expect(sameOrigin("https://folio.test", "folio.test")).toBe(true);
	});

	it("refuses an origin from somewhere else", () => {
		expect(sameOrigin("https://elsewhere.test", "folio.test")).toBe(false);
	});

	it("refuses an origin when there is no host to compare it to", () => {
		expect(sameOrigin("https://folio.test", undefined)).toBe(false);
	});

	// Sandboxed iframes and some privacy tooling send this; it must not throw.
	it("refuses an origin that will not parse", () => {
		expect(sameOrigin("null", "folio.test")).toBe(false);
		expect(sameOrigin("", "folio.test")).toBe(false);
	});
});
