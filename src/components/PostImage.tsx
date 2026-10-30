import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useT } from "../i18n/I18nContext";
import { readImageDataUri } from "../storage/vault";
import { useObsidian } from "../theme/ObsidianContext";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { ImageInline } from "../utils/markdown";

type Props = { image: ImageInline };

/**
 * A picture in a post or in the editor preview: from the web (http/https) or
 * from the Obsidian vault. When it can't be shown, a short note says why.
 */
export default function PostImage({ image }: Props) {
	const theme = useTheme();
	const t = useT();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const { status, resolveImage } = useObsidian();

	const ref = image.image;
	const uri = ref.kind === "web" ? ref.url : resolveImage(ref.path);

	const [ratio, setRatio] = useState<number | null>(null);
	const [failedUri, setFailedUri] = useState<string | null>(null);
	const [triedUri, setTriedUri] = useState<string | null>(null);
	const [data, setData] = useState<{ uri: string; value: string } | null>(
		null,
	);

	if (!uri) {
		const name = ref.kind === "vault" ? ref.path : "";
		return (
			<Note
				s={s}
				text={
					status === "no-vault"
						? t("image.needVault")
						: status === "unreadable"
							? t("image.vaultUnreadable")
							: status === "indexing"
								? t("image.looking")
								: t("image.notFound", { name })
				}
			/>
		);
	}
	if (failedUri === uri) {
		return <Note s={s} text={t("image.loadFailed")} />;
	}

	const onError = () => {
		// Some phones won't open a file of a picked folder straight from its
		// address. Try once more by reading the file ourselves.
		if (ref.kind === "vault" && triedUri !== uri) {
			const target = uri;
			setTriedUri(target);
			readImageDataUri(target, ref.path).then((value) => {
				if (value) setData({ uri: target, value });
				else setFailedUri(target);
			});
		} else {
			setFailedUri(uri);
		}
	};

	const shown = data && data.uri === uri ? data.value : uri;
	return (
		<Image
			source={{ uri: shown }}
			accessible
			accessibilityLabel={image.alt || undefined}
			resizeMode="contain"
			onError={onError}
			onLoad={(e) => {
				const { width, height } = e.nativeEvent.source;
				if (width > 0 && height > 0) setRatio(width / height);
			}}
			style={[
				s.image,
				image.width
					? { width: image.width, maxWidth: "100%" }
					: { width: "100%" },
				image.height
					? { height: image.height }
					: { aspectRatio: ratio ?? 1.5 },
			]}
		/>
	);
}

function Note({ s, text }: { s: Styles; text: string }) {
	const theme = useTheme();
	return (
		<View style={s.note}>
			<Ionicons
				name="image-outline"
				size={18}
				color={theme.text + "99"}
			/>
			<Text style={s.noteText}>{text}</Text>
		</View>
	);
}

type Styles = ReturnType<typeof makeStyles>;

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		image: {
			alignSelf: "flex-start",
			borderRadius: 6,
			marginVertical: 4,
			backgroundColor: t.text + "10",
		},
		note: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			padding: 10,
			marginVertical: 4,
			borderRadius: 6,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: t.text + "44",
		},
		noteText: { color: t.text + "BB", fontSize: 13, flex: 1 },
	});
