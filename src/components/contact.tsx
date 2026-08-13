import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { VStack } from "@astryxdesign/core/VStack";
import { type SubmitEvent, useState } from "react";
import {
	type Deliver,
	type Delivery,
	type Draft,
	limits,
	message,
} from "#/api/message";
import type { ContactSection } from "#/api/sections";
import type { Translate } from "#/lib/strings";

const empty: Draft = { name: "", email: "", message: "", company: "" };

export interface ContactProps {
	readonly section: ContactSection;
	readonly t: Translate;
	readonly send: Deliver;
}

export function Contact({ section, t, send }: ContactProps) {
	const [draft, setDraft] = useState<Draft>(empty);
	const [invalid, setInvalid] = useState<ReadonlyMap<string, string>>(
		new Map(),
	);
	const [delivery, setDelivery] = useState<Delivery | null>(null);
	const [isSending, setIsSending] = useState(false);

	const heading = section.heading || t("contact_heading");

	function set(field: keyof Draft, value: string) {
		setDraft((current) => ({ ...current, [field]: value }));
	}

	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isSending) {
			return;
		}

		// A new attempt withdraws the previous outcome, whichever way this one goes.
		setDelivery(null);

		const parsed = message.safeParse(draft);

		if (!parsed.success) {
			setInvalid(
				new Map(
					parsed.error.issues.map((issue) => [
						String(issue.path[0]),
						issue.message,
					]),
				),
			);
			return;
		}

		setInvalid(new Map());
		setIsSending(true);

		try {
			const outcome = await send(parsed.data);

			setDelivery(outcome);

			if (outcome === "sent") {
				setDraft(empty);
			}
		} catch {
			setDelivery("failed");
		} finally {
			setIsSending(false);
		}
	}

	const status = (field: keyof Draft) => {
		const reason = invalid.get(field);

		return reason === undefined
			? undefined
			: ({ type: "error", message: reason } as const);
	};

	return (
		<VStack gap={4} maxWidth={620}>
			<Heading level={2} type="display-3">
				{heading}
			</Heading>

			{section.blurb ? (
				<Text as="p" color="secondary">
					{section.blurb}
				</Text>
			) : null}

			{delivery === "sent" ? (
				<Banner
					status="success"
					container="section"
					title={t("contact_success")}
				/>
			) : null}

			{delivery !== null && delivery !== "sent" ? (
				<Banner status="error" container="section" title={t("contact_error")} />
			) : null}

			<form onSubmit={submit} noValidate>
				<FormLayout>
					<TextInput
						label={t("contact_name")}
						htmlName="name"
						value={draft.name}
						onChange={(value) => set("name", value)}
						status={status("name")}
						isRequired
					/>

					<TextInput
						label={t("contact_email")}
						htmlName="email"
						type="email"
						value={draft.email}
						onChange={(value) => set("email", value)}
						status={status("email")}
						isRequired
					/>

					<TextArea
						label={t("contact_message")}
						htmlName="message"
						rows={6}
						maxLength={limits.message}
						value={draft.message}
						onChange={(value) => set("message", value)}
						status={status("message")}
						isRequired
					/>

					{/* A honeypot, hidden from sight and assistive tech alike; only scripts fill it. */}
					<VisuallyHidden aria-hidden="true">
						<input
							name="company"
							type="text"
							tabIndex={-1}
							autoComplete="off"
							value={draft.company}
							onChange={(event) => set("company", event.target.value)}
						/>
					</VisuallyHidden>

					<HStack>
						<Button
							label={t("contact_submit")}
							type="submit"
							variant="primary"
							isLoading={isSending}
						/>
					</HStack>
				</FormLayout>
			</form>
		</VStack>
	);
}
