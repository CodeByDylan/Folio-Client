import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { env } from "#/env";
import { deliver, mailConfig, message, resend, sameOrigin } from "./message";

export {
	type Delivery,
	type Draft,
	limits,
	type Message,
	message,
} from "./message";

export const sendMessage = createServerFn({ method: "POST" })
	.validator(message)
	.handler(({ data }) =>
		deliver(data, {
			sameOrigin: sameOrigin(
				getRequestHeader("origin"),
				getRequestHeader("host"),
			),
			config: mailConfig(env()),
			send: resend,
		}),
	);
