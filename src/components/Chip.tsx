import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { readableOn } from "../utils/format";

type Props = { label: string; active: boolean; onPress: () => void };

export default function Chip({ label, active, onPress }: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	return (
		<Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
			<Text style={[s.text, active && s.textActive]}>{label}</Text>
		</Pressable>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		chip: {
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 16,
			borderWidth: 1,
			borderColor: t.accent,
		},
		chipActive: { backgroundColor: t.accent },
		text: { color: t.accent, fontWeight: "600", fontSize: 13 },
		textActive: { color: readableOn(t.accent) },
	});
