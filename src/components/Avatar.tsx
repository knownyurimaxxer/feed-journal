import { ComponentProps } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { readableOn } from "../utils/format";

type Props = {
	/** An Ionicons name, an image URI (file:, content:, http), or null to hide. */
	avatar: string | null;
	size?: number;
};

const IMAGE_URI_RE = /^(file|content|https?):/;

export default function Avatar({ avatar, size = 36 }: Props) {
	const theme = useTheme();
	if (!avatar) return null;
	if (avatar === "photo") avatar = "person";

	if (IMAGE_URI_RE.test(avatar)) {
		return (
			<View style={[styles.box, { width: size, height: size }]}>
				<Image
					source={{ uri: avatar }}
					style={{ width: size, height: size }}
				/>
			</View>
		);
	}

	return (
		<View
			style={[
				styles.box,
				{ width: size, height: size, backgroundColor: theme.accent },
			]}
		>
			<Ionicons
				name={avatar as ComponentProps<typeof Ionicons>["name"]}
				size={size * 0.6}
				color={readableOn(theme.accent)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
});
