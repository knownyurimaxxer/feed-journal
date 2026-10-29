import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";

/** Opens the gallery with a square crop, copies the result into app storage, returns its URI. */
export async function pickAvatarImage(): Promise<string | null> {
	try {
		const res = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});
		if (res.canceled || !res.assets?.[0]) return null;

		// The picker's file lives in the cache and can be purged, so keep our own copy.
		const dest = new File(Paths.document, `avatar-${Date.now()}.jpg`);
		new File(res.assets[0].uri).copy(dest);
		return dest.uri;
	} catch (e) {
		console.warn("Could not pick avatar", e);
		return null;
	}
}

export function deleteAvatarImage(uri: string | null): void {
	if (!uri) return;
	try {
		new File(uri).delete();
	} catch {
		/* already gone */
	}
}
