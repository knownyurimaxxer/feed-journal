import { useEffect, useMemo, useState } from "react";
import {
	LayoutChangeEvent,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import { useT } from "../i18n/I18nContext";
import { useObsidian } from "../theme/ObsidianContext";
import { useTheme } from "../theme/ThemeContext";
import { Theme } from "../types";
import { readableOn } from "../utils/format";
import { MediaInline } from "../utils/markdown";
import { formatElapsed } from "../utils/mediaNames";

type Props = { media: MediaInline };

/**
 * A voice note or video of the vault, played inside the note. The player is
 * only created when the person presses play, so a feed with many recordings
 * doesn't load them all.
 */
export default function MediaPlayer({ media }: Props) {
	const t = useT();
	const theme = useTheme();
	const { resolveImage } = useObsidian();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const uri = resolveImage(media.path); // the vault list holds voice notes and videos too
	const name = media.path.split("/").pop() ?? media.path;

	if (!uri) {
		return (
			<View style={s.row}>
				<MaterialCommunityIcons
					name="file-question-outline"
					size={22}
					color={theme.text + "99"}
				/>
				<Text style={s.name} numberOfLines={1}>
					{`${name} · ${t("player.notFound")}`}
				</Text>
			</View>
		);
	}
	return media.kind === "video" ? (
		<VideoNote uri={uri} name={name} s={s} />
	) : (
		<AudioNote uri={uri} name={name} s={s} />
	);
}

type Styles = ReturnType<typeof makeStyles>;
type NoteProps = { uri: string; name: string; s: Styles };

/* ---- voice notes ---- */

function AudioNote({ uri, name, s }: NoteProps) {
	const t = useT();
	const theme = useTheme();
	const [started, setStarted] = useState(false);
	if (started) return <ActiveAudio uri={uri} s={s} />;
	return (
		<View style={s.row}>
			<Pressable
				style={s.playButton}
				onPress={() => setStarted(true)}
				accessibilityLabel={t("player.play")}
			>
				<MaterialCommunityIcons
					name="play"
					size={22}
					color={readableOn(theme.accent)}
				/>
			</Pressable>
			<Text style={s.name} numberOfLines={1}>
				{name}
			</Text>
		</View>
	);
}

function ActiveAudio({ uri, s }: { uri: string; s: Styles }) {
	const t = useT();
	const theme = useTheme();
	const player = useAudioPlayer(uri);
	const status = useAudioPlayerStatus(player);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
		player.play();
	}, [player]);

	// At the end: rewind and show "play" again.
	useEffect(() => {
		if (status.didJustFinish) {
			player.pause();
			void player.seekTo(0);
		}
	}, [status.didJustFinish, player]);

	const progress =
		status.duration > 0
			? Math.min(1, status.currentTime / status.duration)
			: 0;

	return (
		<View style={s.row}>
			<Pressable
				style={s.playButton}
				onPress={() =>
					status.playing ? player.pause() : player.play()
				}
				accessibilityLabel={t(
					status.playing ? "player.pause" : "player.play",
				)}
			>
				<MaterialCommunityIcons
					name={status.playing ? "pause" : "play"}
					size={22}
					color={readableOn(theme.accent)}
				/>
			</Pressable>
			<Pressable
				style={s.barHit}
				onLayout={(e: LayoutChangeEvent) =>
					setWidth(e.nativeEvent.layout.width)
				}
				onPress={(e) => {
					if (width > 0 && status.duration > 0)
						void player.seekTo(
							(e.nativeEvent.locationX / width) * status.duration,
						);
				}}
			>
				<View style={s.barTrack}>
					<View
						style={[s.barFill, { width: `${progress * 100}%` }]}
					/>
				</View>
			</Pressable>
			<Text style={s.time}>
				{`${formatElapsed(status.currentTime * 1000)} / ${formatElapsed(
					status.duration * 1000,
				)}`}
			</Text>
		</View>
	);
}

/* ---- videos ---- */

function VideoNote({ uri, name, s }: NoteProps) {
	const t = useT();
	const theme = useTheme();
	const [started, setStarted] = useState(false);
	if (started) return <ActiveVideo uri={uri} s={s} />;
	return (
		<Pressable
			style={s.videoTile}
			onPress={() => setStarted(true)}
			accessibilityLabel={t("player.playVideo")}
		>
			<View style={s.playButtonBig}>
				<MaterialCommunityIcons
					name="play"
					size={34}
					color={readableOn(theme.accent)}
				/>
			</View>
			<Text style={s.name} numberOfLines={1}>
				{name}
			</Text>
		</Pressable>
	);
}

function ActiveVideo({ uri, s }: { uri: string; s: Styles }) {
	const player = useVideoPlayer(uri, (p) => {
		p.play();
	});
	return (
		<VideoView
			player={player}
			style={s.video}
			nativeControls
			fullscreenOptions={{ enable: true }}
			contentFit="contain"
		/>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			paddingVertical: 8,
			paddingHorizontal: 10,
			marginVertical: 4,
			borderRadius: 8,
			backgroundColor: t.text + "10",
		},
		playButton: {
			width: 34,
			height: 34,
			borderRadius: 17,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: t.accent,
		},
		playButtonBig: {
			width: 56,
			height: 56,
			borderRadius: 28,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: t.accent,
		},
		name: { flex: 1, color: t.text, fontSize: 14 },
		barHit: { flex: 1, height: 34, justifyContent: "center" },
		barTrack: {
			height: 4,
			borderRadius: 2,
			overflow: "hidden",
			backgroundColor: t.text + "33",
		},
		barFill: { height: 4, backgroundColor: t.accent },
		time: {
			color: t.text + "BB",
			fontSize: 12,
			fontVariant: ["tabular-nums"],
		},
		videoTile: {
			height: 200,
			alignItems: "center",
			justifyContent: "center",
			gap: 10,
			marginVertical: 4,
			paddingHorizontal: 12,
			borderRadius: 8,
			backgroundColor: t.text + "10",
		},
		video: {
			width: "100%",
			height: 360,
			marginVertical: 4,
			borderRadius: 8,
			backgroundColor: "#000",
		},
	});
