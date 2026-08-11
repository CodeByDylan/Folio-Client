import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { Icon } from "@astryxdesign/core/Icon";
import { CheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useRouter } from "@tanstack/react-router";
import { setLocale } from "#/api/server";
import type { Strings } from "#/lib/strings";

export interface LocaleSelectorProps {
	readonly label: string;
	readonly strings: Strings;
	readonly locales: ReadonlyArray<string>;
	readonly active: string;
}

export function LocaleSelector({
	label,
	strings,
	locales,
	active,
}: LocaleSelectorProps) {
	const router = useRouter();
	const name = (locale: string) =>
		strings[`locale_${locale}`] ?? locale.toUpperCase();

	return (
		<DropdownMenu
			hasChevron={false}
			alignment="end"
			menuWidth={180}
			button={{
				label,
				variant: "ghost",
				size: "sm",
				isIconOnly: true,
				icon: <Icon icon={GlobeAltIcon} size="sm" />,
				tooltip: `${label}: ${name(active)}`,
			}}
			items={locales.map((locale) => ({
				label: name(locale),
				icon:
					locale === active ? <Icon icon={CheckIcon} size="xsm" /> : undefined,
				onClick: () => {
					void setLocale({ data: { locale } }).then(() => router.invalidate());
				},
			}))}
		/>
	);
}
