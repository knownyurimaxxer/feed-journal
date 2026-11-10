/**
 * Pure helpers for the media the app saves into the Obsidian vault (pictures,
 * voice notes, screen recordings): the file names, the folders and the
 * ![[embed]] line that goes into the note. Nothing here touches the phone,
 * so it can be tested on its own.
 */
import type { MediaKind, Selection } from "../types";

export const MEDIA_KINDS: MediaKind[] = ["image", "audio", "video"];

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

/** Full date and time as a file name: 7 Nov 2026, 12:55:55 -> "20261107125555". */
export function mediaStamp(d: Date = new Date()): string {
	return (
		`${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
		`${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
	);
}

/**
 * The folders of a vault-relative path typed in Settings ("Attachments/Audio"):
 * "/" or "\" between folders, no empty parts, no "." or "..", and no
 * characters that file systems (or Obsidian) refuse. An empty result means
 * the vault folder itself.
 */
export function folderSegments(path: string): string[] {
	return path
		.split(/[\\/]+/)
		.map((part) => part.replace(/[<>:"|?*\u0000-\u001f]/g, "").trim())
		.filter((part) => part !== "" && part !== "." && part !== "..");
}

/** The folder as it is saved and shown: cleaned, joined with "/". */
export function normalizeFolder(path: string): string {
	return folderSegments(path).join("/");
}

/**
 * "<stamp>.<ext>", or "<stamp>-2.<ext>", "<stamp>-3.<ext>"... when that name
 * is already taken (two files in the same second).
 */
export function mediaFileName(
	stamp: string,
	ext: string,
	taken: (name: string) => boolean,
): string {
	const clean = ext.replace(/^\./, "").toLowerCase();
	let name = `${stamp}.${clean}`;
	for (let n = 2; taken(name); n++) name = `${stamp}-${n}.${clean}`;
	return name;
}

/** The Obsidian embed for a file, given its path from the vault folder. */
export function embedFor(path: string): string {
	return `![[${path}]]`;
}

/**
 * Puts `embed` on a line of its own at the cursor (after the selection, which
 * is kept), and leaves the cursor on the line below it, ready to type.
 */
export function insertEmbed(
	text: string,
	sel: Selection,
	embed: string,
): { text: string; selection: Selection } {
	const at = Math.min(text.length, Math.max(sel.start, sel.end));
	const before = text.slice(0, at);
	const after = text.slice(at);
	const lead = before === "" || before.endsWith("\n") ? "" : "\n";
	const trail = after.startsWith("\n") ? "" : "\n";
	const next = before + lead + embed + trail + after;
	const cursor = before.length + lead.length + embed.length + trail.length;
	return { text: next, selection: { start: cursor, end: cursor } };
}

/** "125" seconds -> "2:05" (for the recording timer). */
export function formatElapsed(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}
