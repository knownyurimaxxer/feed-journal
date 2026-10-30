import { Fragment, ReactNode, useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { LINKS } from "../constants";
import { useT } from "../i18n/I18nContext";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { readableOn } from "../utils/format";

const open = (url: string) => {
	Linking.openURL(url).catch((e) =>
		console.warn("Could not open link", url, e),
	);
};

/**
 * Fills a translated sentence such as "Made by {developer}." with the links
 * that belong in its {placeholders}, wherever the language puts them.
 */
function fill(template: string, parts: Record<string, ReactNode>): ReactNode[] {
	return template.split(/(\{\w+\})/).map((chunk, i) => {
		const name = chunk.match(/^\{(\w+)\}$/)?.[1];
		return name && name in parts ? (
			<Fragment key={i}>{parts[name]}</Fragment>
		) : (
			chunk
		);
	});
}

export default function CreditsSection() {
	const theme = useTheme();
	const t = useT();
	const s = useMemo(() => makeStyles(theme), [theme]);

	const link = (label: string, url: string) => (
		<Text style={s.link} accessibilityRole="link" onPress={() => open(url)}>
			{label}
		</Text>
	);

	return (
		<View style={s.wrap}>
			<Text style={s.section}>{t("credits.about")}</Text>

			<View style={s.card}>
				<Text style={s.body}>
					{fill(t("credits.idea"), {
						post: link(t("credits.ideaPost"), LINKS.ideaPost),
						author: link("@rubensmuse", LINKS.ideaSocial),
					})}
				</Text>
				<Text style={s.body}>
					{fill(t("credits.icons"), {
						ionicons: link("Ionicons", LINKS.ionicons),
						ionic: link("@ionic", LINKS.ionic),
						mdi: link("Material Design Icons", LINKS.mdi),
						pictogrammers: link(
							"@pictogrammers",
							LINKS.pictogrammers,
						),
					})}
				</Text>
				<Text style={s.body}>
					{fill(t("credits.madeBy"), {
						developer: link("@knownyurimaxxer", LINKS.developer),
					})}
				</Text>
				<Text style={s.hint}>{t("credits.kofi")}</Text>
			</View>

			<Pressable
				accessibilityRole="link"
				onPress={() => open(LINKS.kofi)}
				style={({ pressed }) => [s.kofiBtn, pressed && s.pressed]}
			>
				<Text style={s.kofiText}>Ko-fi</Text>
			</Pressable>
		</View>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		wrap: { marginTop: 32 },
		section: {
			color: readableOn(t.background),
			fontWeight: "700",
			marginBottom: 8,
			fontSize: 14,
			opacity: 0.85,
		},
		card: {
			backgroundColor: t.card,
			borderRadius: 8,
			padding: 14,
			paddingTop: 6,
		},
		body: { color: t.text, fontSize: 14, lineHeight: 20, marginTop: 8 },
		link: {
			color: t.accent,
			fontWeight: "600",
			textDecorationLine: "underline",
		},
		hint: {
			color: t.text + "99",
			fontSize: 13,
			lineHeight: 18,
			marginTop: 12,
		},
		kofiBtn: {
			alignSelf: "stretch",
			alignItems: "center",
			marginTop: 12,
			paddingVertical: 12,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: t.accent,
		},
		pressed: { opacity: 0.6 },
		kofiText: { color: t.accent, fontWeight: "700", fontSize: 14 },
	});
