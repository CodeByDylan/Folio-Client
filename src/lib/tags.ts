import type { ProjectSummary } from "#/api";

type Tag = ProjectSummary["tags"][number];

const colours = {
	language: "blue",
	framework: "purple",
	domain: "teal",
	tool: "orange",
} as const;

type TagColour = (typeof colours)[keyof typeof colours] | "default";

export function tagColour(tag: Tag): TagColour {
	return tag.kind !== undefined && tag.kind in colours
		? colours[tag.kind as keyof typeof colours]
		: "default";
}

const statuses = {
	wip: "accent",
	active: "success",
	maintenance: "warning",
	archived: "neutral",
} as const;

type StatusVariant = (typeof statuses)[keyof typeof statuses];

export function statusVariant(status: keyof typeof statuses): StatusVariant {
	return statuses[status];
}
