import { z } from "zod";
import { zGetPageResponse, zPageSectionView } from "./generated/zod.gen";

const known = ["prose"] as const;

const zProse = zPageSectionView.extend({ type: z.literal("prose") });

/** A section type this client predates, so one unknown section cannot cost the page. */
const zUnrecognised = z
	.looseObject({
		id: z.string(),
		// Refusing the known types keeps a malformed known section a contract error.
		type: z.string().refine((type) => !known.includes(type as never)),
	})
	.transform(({ id, type }) => ({
		id,
		type: "unknown" as const,
		declared: type,
	}));

const zSection = z.union([zProse, zUnrecognised]);

/** The page response, with unknown section types tolerated. */
export const zPage = zGetPageResponse.extend({ sections: z.array(zSection) });

export type Page = z.infer<typeof zPage>;
export type PageSection = Page["sections"][number];
export type ProseSection = z.infer<typeof zProse>;
