export interface Page {
	readonly current: number;
	readonly pages: number;
	readonly start: number;
	readonly end: number;
}

/**
 * Clamps a requested page into the range that exists. A list with nothing in it
 * still has one page, so the empty state has somewhere to live.
 */
export function paginate(
	total: number,
	size: number,
	requested: number | undefined,
): Page {
	const pages = Math.max(1, Math.ceil(total / size));
	const current = Math.min(Math.max(requested ?? 1, 1), pages);
	const start = (current - 1) * size;

	return { current, pages, start, end: Math.min(start + size, total) };
}
