/**
 * Saves pictures, voice notes and screen recordings INTO the Obsidian vault
 * (the only place where the app writes to the vault). Files go to a folder
 * of the vault chosen per kind in Settings; missing folders are created.
 */
import { Directory, File } from "expo-file-system";
import { folderSegments, mediaFileName, mediaStamp } from "../utils/mediaNames";

export type SavedMedia = {
	/** Path from the vault folder, as written in the note: "Attachments/Audio/20261107125555.m4a". */
	path: string;
	/** File address, to show it right away. */
	uri: string;
};

/** Opens (creating when needed) the folders of `segments` inside `root`. Names are matched ignoring capitals. */
function ensureFolder(root: Directory, segments: string[]): Directory {
	let dir = root;
	for (const segment of segments) {
		const found = dir
			.list()
			.find(
				(e): e is Directory =>
					e instanceof Directory &&
					e.name.toLowerCase() === segment.toLowerCase(),
			);
		dir = found ?? dir.createDirectory(segment);
	}
	return dir;
}

/**
 * Copies a finished file (picture, recording...) into the vault, named after
 * the moment it is saved ("20261107125555.webp"). The temporary file is
 * deleted afterwards. Throws when the vault can't be written to.
 */
export async function saveToVault(args: {
	vaultUri: string;
	/** Folder inside the vault, as typed in Settings (empty: the vault folder itself). */
	folder: string;
	sourceUri: string;
	ext: string;
	mime: string;
	date?: Date;
}): Promise<SavedMedia> {
	const root = new Directory(args.vaultUri);
	if (!root.exists) throw new Error("The vault folder can't be opened");

	const segments = folderSegments(args.folder);
	const dir = ensureFolder(root, segments);
	const taken = new Set(dir.list().map((e) => e.name.toLowerCase()));
	const name = mediaFileName(mediaStamp(args.date), args.ext, (n) =>
		taken.has(n.toLowerCase()),
	);

	const source = new File(args.sourceUri);
	const dest = dir.createFile(name, args.mime);
	try {
		dest.write(await source.bytes());
	} catch (e) {
		try {
			dest.delete();
		} catch {
			/* nothing more to do */
		}
		throw e;
	}
	try {
		source.delete(); // the temporary copy is no longer needed
	} catch {
		/* the system cleans its cache anyway */
	}
	// Trust the name the file system actually gave us (some providers rename).
	return { path: [...segments, dest.name].join("/"), uri: dest.uri };
}

/** Deletes one file of the vault. Returns false when it couldn't (already gone, no permission). */
export function deleteVaultFile(uri: string): boolean {
	try {
		new File(uri).delete();
		return true;
	} catch {
		return false;
	}
}
