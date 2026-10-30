/**
 * Notes on disk: one Markdown file per note, containing only the note text
 * (plus a "# Title" first line when the note has a name).
 * The folder is either app-private storage (default) or one the user picked.
 */
import { Directory, File, Paths } from "expo-file-system";
import { RawNote } from "../types";
import { parseIdDate } from "../utils/format";

const MD_RE = /\.md$/i;

function defaultDirectory(): Directory {
	const dir = new Directory(Paths.document, "notes");
	if (!dir.exists) dir.create();
	return dir;
}

/** Resolve the saved folder; fall back to app storage if it can't be accessed. */
export function resolveDirectory(uri: string | null): {
	dir: Directory;
	usingFallback: boolean;
} {
	if (uri) {
		try {
			const dir = new Directory(uri);
			if (dir.exists) return { dir, usingFallback: false };
		} catch {
			/* fall through */
		}
		return { dir: defaultDirectory(), usingFallback: true };
	}
	return { dir: defaultDirectory(), usingFallback: false };
}

/** Opens the system folder picker. Returns the folder URI, or null if cancelled. */
export async function pickDirectory(): Promise<string | null> {
	try {
		const dir = await Directory.pickDirectoryAsync();
		return dir.uri;
	} catch {
		return null;
	}
}

const toMs = (t: number) => (t < 1e12 ? t * 1000 : t); // tolerate seconds vs ms

export async function readAllNotes(dir: Directory): Promise<RawNote[]> {
	const files = dir
		.list()
		.filter(
			(entry): entry is File =>
				entry instanceof File && MD_RE.test(entry.name),
		);
	// Every file is read at the same time instead of one after the other.
	const read = await Promise.all(
		files.map(async (entry): Promise<RawNote | null> => {
			try {
				const text = await entry.text();
				const id = entry.name.replace(MD_RE, "");
				let modifiedAt = Date.now();
				try {
					const info = entry.info();
					if (info.modificationTime)
						modifiedAt = toMs(info.modificationTime);
				} catch {
					/* keep default */
				}
				return {
					id,
					uri: entry.uri,
					text,
					createdAt: parseIdDate(id) ?? modifiedAt,
					modifiedAt,
				};
			} catch (e) {
				console.warn("Could not read", entry.name, e);
				return null;
			}
		}),
	);
	return read.filter((n): n is RawNote => n !== null);
}

/** Creates `<name>.md`. The name is the note's title, or a date/time name for unnamed notes. */
export function createNote(
	dir: Directory,
	name: string,
	text: string,
): RawNote {
	const file = dir.createFile(`${name}.md`, "text/markdown");
	file.write(text);
	// Trust the name the file system actually gave us (some providers rename).
	const now = Date.now();
	return {
		id: file.name.replace(MD_RE, ""),
		uri: file.uri,
		text,
		createdAt: now,
		modifiedAt: now,
	};
}

/**
 * "Renames" a note: writes the new file first, then removes the old one, so a
 * failure never loses the note. (Works on every storage provider, including
 * Android folders picked through the system picker.)
 */
export function renameNote(
	dir: Directory,
	oldUri: string,
	name: string,
	text: string,
): { id: string; uri: string } {
	const file = dir.createFile(`${name}.md`, "text/markdown");
	try {
		file.write(text);
		new File(oldUri).delete();
	} catch (e) {
		try {
			file.delete();
		} catch {
			/* nothing more to do */
		}
		throw e;
	}
	return { id: file.name.replace(MD_RE, ""), uri: file.uri };
}

/**
 * Saves new text for a note, keeping its file name.
 *
 * It does NOT write over the existing file: on some phones (folders picked
 * through the system picker especially) writing doesn't cut the file down
 * first, so when the new text is shorter, the end of the old text stays
 * behind and shows up as repeated characters. Starting from an empty file
 * can't leave anything behind. If anything fails, the old text is put back.
 * The file's address can change, so the caller must use the returned one.
 */
export function rewriteNote(
	dir: Directory,
	uri: string,
	previousText: string,
	text: string,
): { id: string; uri: string } {
	const name = new File(uri).name;
	new File(uri).delete();
	let file: File | null = null;
	try {
		file = dir.createFile(name, "text/markdown");
		file.write(text);
	} catch (e) {
		try {
			(file ?? dir.createFile(name, "text/markdown")).write(previousText);
		} catch {
			/* nothing more to do */
		}
		throw e;
	}
	return { id: file.name.replace(MD_RE, ""), uri: file.uri };
}

export function deleteNote(uri: string): void {
	new File(uri).delete();
}

/** Deletes every .md file in the folder. Returns how many were deleted. */
export function deleteAllNotes(dir: Directory): number {
	let count = 0;
	for (const entry of dir.list()) {
		if (entry instanceof File && MD_RE.test(entry.name)) {
			entry.delete();
			count++;
		}
	}
	return count;
}
