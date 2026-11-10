import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
	AudioModule,
	RecordingPresets,
	setAudioModeAsync,
	useAudioRecorder,
} from "expo-audio";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
import { useT } from "../i18n/I18nContext";
import { encodeImage } from "../storage/mediaCompress";
import { saveToVault } from "../storage/mediaStore";
import {
	startScreenRecording,
	stopScreenRecording,
} from "../storage/screenRecorder";
import { useObsidian } from "../theme/ObsidianContext";
import { MediaFolders, MediaQuality } from "../types";
import { haptic } from "../utils/haptics";

/** Voice notes are AAC in .m4a; the channels and bitrate come from Settings (mono 64 kbps is clear for speech, about 0.5 MB a minute). */
const AUDIO_BASE = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 44100 };

/** Where the media goes. Null whenever Obsidian isn't active, which switches the whole feature off. */
export type MediaConfig = {
	vaultUri: string;
	folders: MediaFolders;
	quality: MediaQuality;
};

/** idle, recording a voice note, recording the screen, or compressing and saving. */
export type MediaMode = "idle" | "audio" | "screen" | "saving";

/**
 * Picks pictures, records voice notes and records the screen, saves them in
 * the Obsidian vault and hands the vault path of each saved file to `onSaved`
 * (the editor writes the ![[embed]] into the note).
 */
export function useMediaCapture(
	config: MediaConfig | null,
	onSaved: (path: string) => void,
) {
	const t = useT();
	const { registerFile } = useObsidian();
	const recorder = useAudioRecorder(AUDIO_BASE);
	const [mode, setMode] = useState<MediaMode>("idle");
	const [startedAt, setStartedAt] = useState(0);
	const [elapsed, setElapsed] = useState(0);

	// The newest values, for functions that run after an await.
	const modeRef = useRef(mode);
	modeRef.current = mode;
	const configRef = useRef(config);
	configRef.current = config;
	const onSavedRef = useRef(onSaved);
	onSavedRef.current = onSaved;

	useEffect(() => {
		if (mode !== "audio" && mode !== "screen") return;
		const timer = setInterval(
			() => setElapsed(Date.now() - startedAt),
			500,
		);
		return () => clearInterval(timer);
	}, [mode, startedAt]);

	const fail = useCallback(
		(e: unknown) => {
			haptic("error");
			console.warn("Media capture failed", e);
			Alert.alert(
				t("media.failed"),
				String(e instanceof Error ? e.message : e),
			);
		},
		[t],
	);

	/** Moves a finished file into the vault and tells the editor. */
	const store = useCallback(
		async (
			kind: keyof MediaFolders,
			sourceUri: string,
			ext: string,
			mime: string,
		) => {
			const cfg = configRef.current;
			if (!cfg) throw new Error(t("media.needVault"));
			const saved = await saveToVault({
				vaultUri: cfg.vaultUri,
				folder: cfg.folders[kind],
				sourceUri,
				ext,
				mime,
			});
			registerFile(saved.path, saved.uri);
			onSavedRef.current(saved.path);
		},
		[registerFile, t],
	);

	/* ---- pictures ---- */

	const pickImages = useCallback(async () => {
		if (modeRef.current !== "idle" || !configRef.current) return;
		haptic("action");
		try {
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsMultipleSelection: true,
				quality: 1, // the picture is not touched here; it is compressed once, below
			});
			if (res.canceled || res.assets.length === 0) return;
			setMode("saving");
			for (const asset of res.assets) {
				const image = await encodeImage(asset.uri);
				await store("image", image.uri, image.ext, image.mime);
			}
			haptic("done");
		} catch (e) {
			fail(e);
		} finally {
			setMode("idle");
		}
	}, [fail, store]);

	/* ---- voice notes ---- */

	const startAudio = useCallback(async () => {
		try {
			const perm = await AudioModule.requestRecordingPermissionsAsync();
			if (!perm.granted) throw new Error(t("media.micDenied"));
			await setAudioModeAsync({
				allowsRecording: true,
				playsInSilentMode: true,
			});
			const q = configRef.current?.quality;
			await recorder.prepareToRecordAsync({
				numberOfChannels: q?.audioChannels ?? 1,
				bitRate: (q?.audioKbps ?? 64) * 1000,
			});
			recorder.record();
			setStartedAt(Date.now());
			setElapsed(0);
			setMode("audio");
			haptic("action");
		} catch (e) {
			fail(e);
		}
	}, [fail, recorder, t]);

	const stopAudio = useCallback(async () => {
		setMode("saving");
		try {
			await recorder.stop();
			await setAudioModeAsync({ allowsRecording: false });
			const uri = recorder.uri;
			if (!uri) throw new Error(t("media.nothingRecorded"));
			await store("audio", uri, "m4a", "audio/mp4");
			haptic("done");
		} catch (e) {
			fail(e);
		} finally {
			setMode("idle");
		}
	}, [fail, recorder, store, t]);

	/* ---- screen recording ---- */

	const startScreen = useCallback(async () => {
		try {
			const q = configRef.current?.quality;
			await startScreenRecording(
				q?.screenCodec ?? "h264",
				q?.screenMbps ?? 2,
			);
			setStartedAt(Date.now());
			setElapsed(0);
			setMode("screen");
			haptic("action");
		} catch (e) {
			fail(e);
		}
	}, [fail]);

	const stopScreen = useCallback(async () => {
		setMode("saving");
		try {
			const uri = await stopScreenRecording();
			if (!uri) throw new Error(t("media.nothingRecorded"));
			await store("video", uri, "mp4", "video/mp4");
			haptic("done");
		} catch (e) {
			fail(e);
		} finally {
			setMode("idle");
		}
	}, [fail, store, t]);

	const toggleAudio = useCallback(() => {
		if (!configRef.current) return;
		if (modeRef.current === "idle") void startAudio();
		else if (modeRef.current === "audio") void stopAudio();
	}, [startAudio, stopAudio]);

	const toggleScreen = useCallback(() => {
		if (!configRef.current) return;
		if (modeRef.current === "idle") void startScreen();
		else if (modeRef.current === "screen") void stopScreen();
	}, [startScreen, stopScreen]);

	// Closing the editor while recording throws the recording away.
	useEffect(
		() => () => {
			if (modeRef.current === "audio") {
				recorder
					.stop()
					.then(() => {
						if (recorder.uri) new File(recorder.uri).delete();
					})
					.catch(() => {});
			} else if (modeRef.current === "screen") {
				stopScreenRecording()
					.then((uri) => {
						if (uri) new File(uri).delete();
					})
					.catch(() => {});
			}
		},
		[],
	);

	return { mode, elapsed, pickImages, toggleAudio, toggleScreen };
}
