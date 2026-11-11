/**
 * Compression of what gets saved to the vault.
 *   pictures: WebP at quality 100 (here)
 *   voice notes: AAC in an .m4a file, mono 64 kbps (see useMediaCapture)
 *   screen recordings: H.264 .mp4 at a fixed bitrate (see screenRecorder)
 */
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export type EncodedImage = { uri: string; ext: string; mime: string };

/**
 * Re-encodes a picture as WebP with the quality at 100%. If this phone can't
 * write WebP (iOS can't), the picture is saved as a JPEG at 100% instead, so
 * a picture is never lost.
 */
export async function encodeImage(uri: string): Promise<EncodedImage> {
	const image = await ImageManipulator.manipulate(uri).renderAsync();
	try {
		const out = await image.saveAsync({
			format: SaveFormat.WEBP,
			compress: 1,
		});
		return { uri: out.uri, ext: "webp", mime: "image/webp" };
	} catch (e) {
		console.warn("WebP isn't available here, saving a JPEG instead", e);
		const out = await image.saveAsync({
			format: SaveFormat.JPEG,
			compress: 1,
		});
		return { uri: out.uri, ext: "jpg", mime: "image/jpeg" };
	}
}
