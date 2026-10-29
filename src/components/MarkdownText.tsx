import { ReactNode, useMemo } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { linkColor } from "../utils/format";
import { Inline, parseBlocks, parseInline } from "../utils/markdown";

type Props = { text: string };
type Styles = ReturnType<typeof makeStyles>;

/** Renders the Markdown subset the editor produces (links open on tap). */
export default function MarkdownText({ text }: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const blocks = useMemo(() => parseBlocks(text), [text]);

	return (
		<View>
			{blocks.map((b, i) => {
				const key = `b${i}`;
				switch (b.type) {
					case "heading": {
						const heading = [s.h1, s.h2, s.h3, s.h4][
							Math.min(b.level, 4) - 1
						];
						return (
							<Text
								key={key}
								style={[s.body, s.heading, heading]}
							>
								{renderInline(parseInline(b.text), s, key)}
							</Text>
						);
					}
					case "quote":
						return (
							<View key={key} style={s.quote}>
								{b.lines.map((line, j) => (
									<Text key={j} style={[s.body, s.quoteText]}>
										{renderInline(
											parseInline(line),
											s,
											`${key}.${j}`,
										)}
									</Text>
								))}
							</View>
						);
					case "code":
						return (
							<View key={key} style={s.codeBlock}>
								<Text style={s.codeText}>{b.text}</Text>
							</View>
						);
					case "bullet":
					case "ordered":
						return (
							<View key={key} style={s.row}>
								<Text style={s.marker}>
									{b.type === "bullet" ? "\u2022" : `${b.n}.`}
								</Text>
								<Text style={[s.body, s.rowText]}>
									{renderInline(parseInline(b.text), s, key)}
								</Text>
							</View>
						);
					case "paragraph":
						return (
							<Text key={key} style={s.body}>
								{renderInline(parseInline(b.text), s, key)}
							</Text>
						);
					case "blank":
						return <View key={key} style={s.gap} />;
				}
			})}
		</View>
	);
}

/** Opens a link in the browser (or mail app); tells the user when nothing can handle it. */
function openLink(href: string) {
	Linking.openURL(href).catch(() =>
		Alert.alert("Couldn't open the link", href),
	);
}

function renderInline(nodes: Inline[], s: Styles, key: string): ReactNode[] {
	return nodes.map((n, i) => {
		const k = `${key}.${i}`;
		switch (n.type) {
			case "text":
				return n.text;
			case "code":
				return (
					<Text key={k} style={s.inlineCode}>
						{n.text}
					</Text>
				);
			case "bold":
				return (
					<Text key={k} style={s.bold}>
						{renderInline(n.children, s, k)}
					</Text>
				);
			case "italic":
				return (
					<Text key={k} style={s.italic}>
						{renderInline(n.children, s, k)}
					</Text>
				);
			case "strike":
				return (
					<Text key={k} style={s.strike}>
						{renderInline(n.children, s, k)}
					</Text>
				);
			case "link":
				return (
					<Text
						key={k}
						style={s.link}
						accessibilityRole="link"
						onPress={() => openLink(n.href)}
					>
						{renderInline(n.children, s, k)}
					</Text>
				);
		}
	});
}

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		body: { color: t.text, fontSize: 16, lineHeight: 23 },
		heading: { fontWeight: "700", marginTop: 4 },
		h1: { fontSize: 22, lineHeight: 28 },
		h2: { fontSize: 20, lineHeight: 26 },
		h3: { fontSize: 18, lineHeight: 24 },
		h4: { fontSize: 16, lineHeight: 23 },
		bold: { fontWeight: "700" },
		italic: { fontStyle: "italic" },
		strike: { textDecorationLine: "line-through" },
		link: { color: linkColor(t), textDecorationLine: "underline" },
		inlineCode: { fontFamily: MONO, backgroundColor: t.text + "18" },
		quote: {
			borderLeftWidth: 3,
			borderLeftColor: t.accent,
			paddingLeft: 10,
			marginVertical: 2,
		},
		quoteText: { opacity: 0.85 },
		codeBlock: {
			backgroundColor: t.text + "14",
			borderRadius: 6,
			padding: 10,
			marginVertical: 4,
		},
		codeText: {
			color: t.text,
			fontFamily: MONO,
			fontSize: 14,
			lineHeight: 20,
		},
		row: { flexDirection: "row" },
		marker: { color: t.text, fontSize: 16, lineHeight: 23, minWidth: 22 },
		rowText: { flex: 1 },
		gap: { height: 8 },
	});
