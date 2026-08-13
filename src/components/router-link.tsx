import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, Ref } from "react";
import { isInternal } from "#/lib/routing";

export interface RouterLinkProps
	extends AnchorHTMLAttributes<HTMLAnchorElement> {
	href?: string;
	/** Astryx passes the target under both names so either router convention works. */
	to?: string;
	ref?: Ref<HTMLAnchorElement>;
}

export function RouterLink({ href, to, ref, ...rest }: RouterLinkProps) {
	if (!isInternal(href)) {
		return <a href={href} ref={ref} {...rest} />;
	}

	return <Link to={href} ref={ref} {...rest} />;
}
