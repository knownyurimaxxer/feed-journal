import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { LINKS } from "../constants";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { readableOn } from "../utils/format";

const open = (url: string) => {
	Linking.openURL(url).catch((e) =>
		console.warn("Could not open link", url, e),
	);
};

export default function CreditsSection() {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);

	return (
		<View style={s.wrap}>
			<Text style={s.section}>About</Text>

			<View style={s.card}>
				<Text style={s.body}>
					The idea for this app comes from{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.ideaPost)}
					>
						this post
					</Text>{" "}
					by{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.ideaSocial)}
					>
						@rubensmuse
					</Text>{" "}
					on Tumblr.
				</Text>
				<Text style={s.body}>
					Made by{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.developer)}
					>
						@knownyurimaxxer
					</Text>
					.
				</Text>
				<Text style={s.body}>
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.ionicons)}
					>
						Ionicons
					</Text>{" "}
					by{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.ionic)}
					>
						@ionic
					</Text>{" "}
					and{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.mdi)}
					>
						Material Design Icons
					</Text>{" "}
					by{" "}
					<Text
						style={s.link}
						accessibilityRole="link"
						onPress={() => open(LINKS.pictogrammers)}
					>
						@pictogrammers
					</Text>
					.
				</Text>
				<Text style={s.hint}>
					If you ever feel like it, I have a Ko-fi page!
				</Text>
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
		wrap: { marginTop: 32, marginBottom: -32 },
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
