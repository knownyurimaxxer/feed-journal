import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { clampLimit } from "../utils/limits";

type Props = {
	title: string;
	hint: string;
	value: number;
	min: number;
	max: number;
	onChange: (n: number) => void;
};

/**
 * A whole-number box. Valid numbers are saved while you type (so closing the
 * screen with the keyboard open loses nothing); when you leave the box, a
 * number that is too big, too small or missing snaps to the nearest allowed one.
 */
export default function NumberField({
	title,
	hint,
	value,
	min,
	max,
	onChange,
}: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const [draft, setDraft] = useState(String(value));

	// Follow the value when it changes from outside (e.g. a reset).
	useEffect(() => setDraft(String(value)), [value]);

	const onChangeText = (text: string) => {
		const digits = text.replace(/\D/g, "").slice(0, String(max).length);
		setDraft(digits);
		if (!digits) return;
		const n = Number(digits);
		if (n >= min && n <= max && n !== value) onChange(n);
	};

	const finish = () => {
		const n = clampLimit(draft, min, max, value);
		setDraft(String(n));
		if (n !== value) onChange(n);
	};

	return (
		<View style={s.row}>
			<View style={s.texts}>
				<Text style={s.title}>{title}</Text>
				<Text style={s.hint}>{hint}</Text>
			</View>
			<TextInput
				style={s.input}
				value={draft}
				onChangeText={onChangeText}
				onBlur={finish}
				onSubmitEditing={finish}
				keyboardType="number-pad"
				returnKeyType="done"
				selectTextOnFocus
				accessibilityLabel={title}
			/>
		</View>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: t.card,
			borderRadius: 8,
			padding: 14,
		},
		texts: { flex: 1, paddingRight: 12 },
		title: { color: t.text, fontWeight: "700", fontSize: 15 },
		hint: {
			color: t.text + "99",
			fontSize: 13,
			marginTop: 4,
			lineHeight: 18,
		},
		input: {
			minWidth: 76,
			textAlign: "center",
			color: t.text,
			backgroundColor: t.text + "14",
			borderRadius: 8,
			paddingHorizontal: 10,
			paddingVertical: 8,
			fontSize: 16,
			fontWeight: "700",
		},
	});
