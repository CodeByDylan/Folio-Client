import { Heading } from "@astryxdesign/core/Heading";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { sendMessage } from "#/api/contact";
import type { Deliver } from "#/api/message";
import { createProvenance } from "#/api/provenance";
import type { Page } from "#/api/sections";
import { PageColumn } from "#/components/page-column";
import { PageSections } from "#/components/page-sections";
import { NoContent } from "#/components/states";
import { useShell } from "#/lib/shell";

/** The server function takes its argument wrapped; the Section just wants to send. */
const send: Deliver = (data) => sendMessage({ data });

export interface PageBodyProps {
	readonly page: Page;
}

/** Everything a content Page renders, whichever route reached it. */
export function PageBody({ page }: PageBodyProps) {
	const { projects, t } = useShell();

	return (
		<PageColumn gap={8}>
			{page.navLabel && !page.home ? (
				<Heading level={1} type="display-2">
					{page.navLabel}
				</Heading>
			) : (
				// Assistive tech needs the h1 even where the design shows none.
				<VisuallyHidden>
					<Heading level={1}>
						{page.navLabel || (page.home ? t("home") : page.slug)}
					</Heading>
				</VisuallyHidden>
			)}

			<PageSections
				sections={page.sections}
				projects={projects}
				provenance={createProvenance(page.provenance)}
				t={t}
				send={send}
				empty={<NoContent t={t} />}
			/>
		</PageColumn>
	);
}
