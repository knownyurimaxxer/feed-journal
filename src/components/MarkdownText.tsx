import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { translate } from "../i18n";
import { useObsidian } from "../theme/ObsidianContext";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { linkColor } from "../utils/format";
import { haptic } from "../utils/haptics";
import { Inline, parseBlocks, parseInline } from "../utils/markdown";
import PostImage from "./PostImage";

type Props = {
	text: string;
	/** Tap on a checklist box: the 0-based line of the item. Without it the boxes can't be tapped. */
	onToggleTask?: (line: number) => void;
};
type Styles = ReturnType<typeof makeStyles>;

/** Renders the Markdown subset the editor produces (links open on tap, pictures show, checklists can be ticked). */
export default function MarkdownText({ text, onToggleTask }: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const { enabled } = useObsidian();
	const opts = useMemo(() => ({ obsidian: enabled }), [enabled]);
	const blocks = useMemo(() => parseBlocks(text, opts), [text, opts]);

	return (
		<View>
			{blocks.map((b, i) => {
				const key = `b${i}`;
				switch (b.type) {
					case "heading": {
						const heading = [s.h1, s.h2, s.h3, s.h4, s.h5][
							Math.min(b.level, 5) - 1
						];
						return (
							<Text
								key={key}
								style={[s.body, s.heading, heading]}
							>
								{renderInline(
									parseInline(b.text, opts),
									s,
									key,
								)}
							</Text>
						);
					}
					case "quote":
						return (
							<View key={key} style={s.quote}>
								{b.lines.map((line, j) =>
									renderRich(
										parseInline(line, opts),
										s,
										`${key}.${j}`,
										[s.body, s.quoteText],
									),
								)}
							</View>
						);
					case "code":
						return <CodeBlock key={key} text={b.text} s={s} />;
					case "bullet":
					case "ordered":
						return (
							<View key={key} style={s.row}>
								<Text style={s.marker}>
									{b.type === "bullet" ? "\u2022" : `${b.n}.`}
								</Text>
								{renderRich(
									parseInline(b.text, opts),
									s,
									`${key}.t`,
									s.body,
									s.rowText,
								)}
							</View>
						);
					case "task":
						return (
							<View key={key} style={s.row}>
								<Pressable
									onPress={() => onToggleTask?.(b.line)}
									disabled={!onToggleTask}
									hitSlop={8}
									accessibilityRole="checkbox"
									accessibilityState={{ checked: b.checked }}
									style={s.checkbox}
								>
									<Ionicons
										name={
											b.checked
												? "checkbox"
												: "square-outline"
										}
										size={21}
										color={
											b.checked
												? linkColor(theme)
												: theme.text + "AA"
										}
									/>
								</Pressable>
								{renderRich(
									parseInline(b.text, opts),
									s,
									`${key}.t`,
									[s.body, b.checked && s.done],
									s.rowText,
								)}
							</View>
						);
					case "paragraph":
						return renderRich(
							parseInline(b.text, opts),
							s,
							key,
							s.body,
						);
					case "blank":
						return <View key={key} style={s.gap} />;
				}
			})}
		</View>
	);
}

/** A fenced code block with a button (top right) that copies its content. */
function CodeBlock({ text, s }: { text: string; s: Styles }) {
	const theme = useTheme();
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (timer.current) clearTimeout(timer.current);
		},
		[],
	);

	const copy = async () => {
		try {
			await Clipboard.setStringAsync(text);
		} catch (e) {
			console.warn("Could not copy the code", e);
			return;
		}
		haptic("action");
		setCopied(true);
		if (timer.current) clearTimeout(timer.current);
		timer.current = setTimeout(() => setCopied(false), 1500);
	};

	return (
		<View style={s.codeBlock}>
			<Text style={s.codeText}>{text}</Text>
			<Pressable
				onPress={copy}
				hitSlop={8}
				accessibilityRole="button"
				accessibilityLabel={translate(
					copied ? "code.copied" : "code.copy",
				)}
				style={({ pressed }) => [
					s.copyBtn,
					pressed && { opacity: 0.6 },
				]}
			>
				<Ionicons
					name={copied ? "checkmark" : "copy-outline"}
					size={16}
					color={copied ? linkColor(theme) : theme.text + "AA"}
				/>
			</Pressable>
		</View>
	);
}

/** Opens a link in the browser (or mail app); tells the user when nothing can handle it. */
function openLink(href: string) {
	Linking.openURL(href).catch(() =>
		Alert.alert(translate("link.openFailed"), href),
	);
}

/**
 * One line of text. Pictures can't sit inside a <Text>, so when the line has
 * any, it is cut at each picture: text, picture, text... Without pictures it
 * is the same single <Text> as always. `box` is the style of the whole line
 * (a list item's text takes the room left next to its marker).
 */
function renderRich(
	nodes: Inline[],
	s: Styles,
	key: string,
	style: StyleProp<TextStyle>,
	box?: StyleProp<TextStyle>,
): ReactNode {
	if (!nodes.some((n) => n.type === "image")) {
		return (
			<Text key={key} style={[style, box]}>
				{renderInline(nodes, s, key)}
			</Text>
		);
	}
	const parts: ReactNode[] = [];
	let run: Inline[] = [];
	const flush = () => {
		// Spaces between two pictures are not worth a line of their own.
		if (run.some((n) => n.type !== "text" || n.text.trim() !== "")) {
			const k = `${key}.${parts.length}`;
			parts.push(
				<Text key={k} style={style}>
					{renderInline(run, s, k)}
				</Text>,
			);
		}
		run = [];
	};
	for (const n of nodes) {
		if (n.type === "image") {
			flush();
			parts.push(<PostImage key={`${key}.${parts.length}`} image={n} />);
		} else run.push(n);
	}
	flush();
	return (
		<View key={key} style={box}>
			{parts}
		</View>
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
			case "image":
				// Only reached for a picture inside bold, a link, a heading...: those can't hold one.
				return (
					n.alt ||
					(n.image.kind === "web" ? n.image.url : n.image.path)
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
		h5: { fontSize: 14, lineHeight: 20 },
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
			paddingRight: 26, // room for the copy button
			color: t.text,
			fontFamily: MONO,
			fontSize: 14,
			lineHeight: 20,
		},
		copyBtn: {
			position: "absolute",
			top: 6,
			right: 6,
			padding: 4,
			borderRadius: 6,
			backgroundColor: t.background + "CC",
		},
		row: { flexDirection: "row" },
		marker: { color: t.text, fontSize: 16, lineHeight: 23, minWidth: 22 },
		rowText: { flex: 1 },
		checkbox: { minWidth: 28, paddingTop: 1 },
		done: { opacity: 0.55, textDecorationLine: "line-through" },
		gap: { height: 8 },
	});
