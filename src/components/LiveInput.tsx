import { ComponentRef, RefObject, useMemo } from "react";
import { Platform, StyleSheet, Text, TextInput } from "react-native";
import { useObsidian } from "../theme/ObsidianContext";
import { useTheme } from "../theme/ThemeContext";
import { Selection, Theme } from "../types";
import { linkColor } from "../utils/format";
import { activeLineRange, liveSpans, Span } from "../utils/liveStyle";

type Props = {
	inputRef: RefObject<ComponentRef<typeof TextInput> | null>;
	value: string;
	/** Raw mode: plain monospace Markdown, no live styling. */
	raw: boolean;
	focused: boolean;
	selection: Selection;
	forcedSelection: Selection | undefined;
	placeholder: string;
	onChangeText: (v: string) => void;
	onSelectionChange: (sel: Selection) => void;
	onFocus: () => void;
	onBlur: () => void;
};

/**
 * A text input that shows the Markdown formatted while you type.
 * The text itself is never changed: the styling is applied by giving the
 * input styled <Text> children (see utils/liveStyle.ts).
 */
export default function LiveInput({
	inputRef,
	value,
	raw,
	focused,
	selection,
	forcedSelection,
	placeholder,
	onChangeText,
	onSelectionChange,
	onFocus,
	onBlur,
}: Props) {
	const theme = useTheme();
	const st = useMemo(() => makeStyles(theme), [theme]);
	const { enabled: obsidian } = useObsidian();

	// Only the lines being edited matter, so the styled text is rebuilt when
	// the cursor changes line, not on every cursor move.
	const [first, last] = focused
		? activeLineRange(value, selection)
		: [-1, -1];
	const children = useMemo(() => {
		if (raw) return value ? <Text style={st.raw}>{value}</Text> : null;
		const spans = liveSpans(value, first < 0 ? null : [first, last], {
			obsidian,
		});
		return spans.map((span, i) => (
			<Text key={i} style={spanStyle(span, st)}>
				{span.text}
			</Text>
		));
	}, [value, raw, first, last, st, obsidian]);

	return (
		<TextInput
			ref={inputRef}
			style={st.input}
			multiline
			scrollEnabled={false}
			autoFocus
			textAlignVertical="top"
			placeholder={placeholder}
			placeholderTextColor={theme.text + "77"}
			selection={forcedSelection}
			onChangeText={onChangeText}
			onSelectionChange={(e) =>
				onSelectionChange(e.nativeEvent.selection)
			}
			onFocus={onFocus}
			onBlur={onBlur}
		>
			{children}
		</TextInput>
	);
}

type Styles = ReturnType<typeof makeStyles>;

const HEADING_SIZES = [26, 24, 21, 19];

function spanStyle(span: Span, st: Styles) {
	if (span.hidden) return st.hidden;
	const out: object[] = [];
	if (span.block) out.push(st.block);
	if (span.heading) {
		out.push(st.heading, {
			fontSize: HEADING_SIZES[Math.min(span.heading, 4) - 1],
		});
	}
	if (span.bold) out.push(st.bold);
	if (span.italic) out.push(st.italic);
	if (span.strike) out.push(st.strike);
	if (span.code) out.push(st.code);
	if (span.link) out.push(st.link);
	if (span.quote) out.push(st.quote);
	if (span.marker) out.push(st.marker);
	if (span.task) out.push(st.taskBox);
	if (span.image) out.push(st.imageChip);
	if (span.done) out.push(st.done);
	if (span.dim) out.push(st.dim);
	return out;
}

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		input: {
			color: t.text,
			fontSize: 18,
			minHeight: 160,
			paddingVertical: 6,
		},
		raw: { fontFamily: MONO, fontSize: 16, color: t.text },
		// Syntax characters on lines you are not editing: practically zero size.
		hidden: { fontSize: 1, color: "transparent" },
		dim: { color: t.text + "55" },
		heading: { fontWeight: "700" },
		bold: { fontWeight: "700" },
		italic: { fontStyle: "italic" },
		strike: { textDecorationLine: "line-through" },
		code: { fontFamily: MONO, backgroundColor: t.text + "18" },
		link: { color: linkColor(t), textDecorationLine: "underline" },
		block: {
			fontFamily: MONO,
			fontSize: 15,
			backgroundColor: t.text + "14",
		},
		quote: { color: t.text + "CC" },
		marker: { color: t.accent, fontWeight: "700" },
		taskBox: { fontFamily: MONO },
		imageChip: { fontFamily: MONO, fontSize: 15, fontWeight: "400" },
		done: { textDecorationLine: "line-through", color: t.text + "88" },
	});
