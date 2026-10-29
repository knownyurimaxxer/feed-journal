import { useEffect, useMemo } from "react";
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { Anchor, Theme } from "../types";

const MENU_WIDTH = 168;
const ITEM_HEIGHT = 48;
const MENU_HEIGHT = ITEM_HEIGHT * 2 + 2;
const GAP = 6;
const MARGIN = 8;
const DANGER = "#FF4D4D";

type Props = {
	visible: boolean;
	anchor: Anchor | null;
	onClose: () => void;
	onEdit: () => void;
	onDelete: () => void;
};

export default function PostMenu({
	visible,
	anchor,
	onClose,
	onEdit,
	onDelete,
}: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const { width, height } = useWindowDimensions();

	// The anchor position goes stale when the screen rotates, so just close.
	useEffect(() => {
		if (visible) onClose();
	}, [width, height]);

	if (!anchor) return null;

	const below = anchor.y + anchor.height + GAP;
	const top =
		below + MENU_HEIGHT > height - MARGIN
			? Math.max(MARGIN, anchor.y - GAP - MENU_HEIGHT)
			: below;
	const left = Math.min(
		Math.max(MARGIN, anchor.x + anchor.width - MENU_WIDTH),
		width - MENU_WIDTH - MARGIN,
	);

	return (
		<Modal
			transparent
			visible={visible}
			animationType="none"
			statusBarTranslucent
			onRequestClose={onClose}
			supportedOrientations={["portrait", "landscape"]}
		>
			<Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
				<View style={[s.menu, { top, left }]}>
					<Pressable
						style={({ pressed }) => [s.item, pressed && s.pressed]}
						onPress={onEdit}
					>
						<Ionicons
							name="create-outline"
							size={20}
							color={theme.text}
						/>
						<Text style={s.itemText}>Edit</Text>
					</Pressable>
					<View style={s.divider} />
					<Pressable
						style={({ pressed }) => [s.item, pressed && s.pressed]}
						onPress={onDelete}
					>
						<Ionicons
							name="trash-outline"
							size={20}
							color={DANGER}
						/>
						<Text style={[s.itemText, { color: DANGER }]}>
							Delete
						</Text>
					</Pressable>
				</View>
			</Pressable>
		</Modal>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		menu: {
			position: "absolute",
			width: MENU_WIDTH,
			backgroundColor: t.card,
			borderRadius: 8,
			elevation: 8,
		},
		item: {
			height: ITEM_HEIGHT,
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			paddingHorizontal: 16,
		},
		pressed: { backgroundColor: t.text + "14" },
		itemText: { color: t.text, fontSize: 15, fontWeight: "600" },
		divider: {
			height: StyleSheet.hairlineWidth,
			backgroundColor: t.text + "33",
		},
	});
