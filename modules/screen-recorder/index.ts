import { requireOptionalNativeModule } from "expo";

/** What the native screen recorder (Android) offers. */
export type ScreenRecorderNative = {
	/** Codecs this phone can record: "h264", plus "hevc" when it has an encoder. */
	supportedCodecs(): string[];
	/** Asks the system for permission, then records. Resolves with the codec really used. */
	start(codec: string, bitrate: number, fps: number): Promise<string>;
	/** Stops; resolves with the file:// address of the .mp4, or null if nothing was kept. */
	stop(): Promise<string | null>;
};

/** Null where there is no native recorder (iOS, Expo Go). */
export default requireOptionalNativeModule<ScreenRecorderNative>(
	"ScreenRecorder",
);
