import { z } from "zod";
import type { MailEnvironment } from "#/env";

/** The lengths the form enforces and the inputs advertise. */
export const limits = {
	name: 100,
	email: 254,
	message: 5000,
	company: 200,
} as const;

/** What the form sends. The fields are fixed here, not described by the API. */
export const message = z.object({
	name: z.string().trim().min(1).max(limits.name),
	email: z.email().max(limits.email),
	message: z.string().trim().min(1).max(limits.message),
	// The honeypot is accepted here and judged on delivery, so a bot sees an ordinary success.
	company: z.string().max(limits.company).optional(),
});

export type Message = z.infer<typeof message>;

/** What the form holds while it is being filled in, before anything is validated. */
export type Draft = Required<z.input<typeof message>>;

/** A form on this site posts same-origin. An Origin that will not parse is not one. */
export function sameOrigin(
	origin: string | undefined,
	host: string | undefined,
): boolean {
	if (origin === undefined) {
		return true;
	}

	if (host === undefined) {
		return false;
	}

	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}

export type Delivery = "sent" | "rejected" | "unconfigured" | "failed";

/** Hands a filled-in form somewhere. The RPC in production, a stub in tests. */
export type Deliver = (data: Message) => Promise<Delivery>;

/** The addresses and credential a transport needs, once every one of them is present. */
export interface MailConfig {
	readonly key: string;
	readonly to: string;
	readonly from: string;
}

/** Hands one message to a mail provider, reporting only whether it was accepted. */
export type MailTransport = (
	data: Message,
	config: MailConfig,
) => Promise<boolean>;

/** Reads the mail settings, which are all present or the form is off. */
export function mailConfig(source: MailEnvironment): MailConfig | undefined {
	const { RESEND_API_KEY: key, CONTACT_TO: to, CONTACT_FROM: from } = source;

	return key === undefined || to === undefined || from === undefined
		? undefined
		: { key, to, from };
}

/** Decides what becomes of one message, given a transport to hand it to. */
export async function deliver(
	data: Message,
	context: {
		readonly sameOrigin: boolean;
		readonly config: MailConfig | undefined;
		readonly send: MailTransport;
	},
): Promise<Delivery> {
	if (!context.sameOrigin) {
		return "rejected";
	}

	// Answering a bot with success denies it the signal it is looking for.
	if (data.company !== undefined && data.company !== "") {
		return "sent";
	}

	if (context.config === undefined) {
		return "unconfigured";
	}

	try {
		return (await context.send(data, context.config)) ? "sent" : "failed";
	} catch {
		return "failed";
	}
}

/** Delivers through Resend, the provider this site is configured for. */
export const resend: MailTransport = async (data, config) => {
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			authorization: `Bearer ${config.key}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			from: config.from,
			to: config.to,
			reply_to: data.email,
			subject: `Portfolio message from ${data.name}`,
			text: `${data.name} <${data.email}>\n\n${data.message}`,
		}),
	});

	return response.ok;
};
