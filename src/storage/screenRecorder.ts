/**
 * Screen recording of the phone, done by the local native module in
 * modules/screen-recorder (Android only: MediaProjection + MediaRecorder).
 * The codec (H.264 or H.265/HEVC) and the video bitrate come from Settings.
 * It is native code, so it needs a development build: it doesn't run in Expo Go.
 */
import ScreenRecorder from "../../modules/screen-recorder";
import { ScreenCodec } from "../types";

const FPS = 30;

/** The codecs this phone can record. Empty when screen recording isn't available at all. */
export function supportedScreenCodecs(): ScreenCodec[] {
	if (!ScreenRecorder) return [];
	try {
		return ScreenRecorder.supportedCodecs().filter(
			(c): c is ScreenCodec => c === "h264" || c === "hevc",
		);
	} catch {
		return [];
	}
}

/**
 * Asks for permission and starts recording the screen (no microphone).
 * `mbps` is the video bitrate in megabits per second. If the phone has no
 * encoder for the codec asked, H.264 is used.
 */
export async function startScreenRecording(
	codec: ScreenCodec,
	mbps: number,
): Promise<void> {
	if (!ScreenRecorder)
		throw new Error("Screen recording isn't available here");
	await ScreenRecorder.start(codec, Math.round(mbps * 1_000_000), FPS);
}

/** Stops recording; returns the address of the .mp4, or null when nothing was kept. */
export async function stopScreenRecording(): Promise<string | null> {
	if (!ScreenRecorder) return null;
	return ScreenRecorder.stop();
}
