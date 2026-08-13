import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { Icon } from "@astryxdesign/core/Icon";
import { CheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useRouter } from "@tanstack/react-router";
import { setLocale } from "#/api/server";
import type { Translate } from "#/lib/strings";

export interface LocaleSelectorProps {
	readonly t: Translate;
	readonly locales: ReadonlyArray<string>;
	readonly active: string;
}

export function LocaleSelector({ t, locales, active }: LocaleSelectorProps) {
	const router = useRouter();
	const label = t("language");
	const name = t.locale;

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
					// A failed write leaves the old locale, which the unchanged page already shows.
					void setLocale({ data: { locale } })
						.then(() => router.invalidate())
						.catch(() => {});
				},
			}))}
		/>
	);
}
