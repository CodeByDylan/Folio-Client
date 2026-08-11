import { Link } from "@tanstack/react-router";
import type { AnchorHTMLAttributes, Ref } from "react";

export interface RouterLinkProps
	extends AnchorHTMLAttributes<HTMLAnchorElement> {
	href?: string;
	ref?: Ref<HTMLAnchorElement>;
}

function isInternal(href: string | undefined): href is string {
	return href?.startsWith("/") === true;
}

export function RouterLink({ href, ref, ...rest }: RouterLinkProps) {
	if (!isInternal(href)) {
		return <a href={href} ref={ref} {...rest} />;
	}

	return <Link to={href} ref={ref} {...rest} />;
}
