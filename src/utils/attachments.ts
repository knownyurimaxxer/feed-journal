/**
 * Which vault files go away together with a note (when the person turns that
 * on in Settings). Deleting is permanent, so this is deliberately careful:
 *   - only files the app saved itself (named like 20261107125555.webp), never
 *     pictures or recordings that were already in the vault
 *   - only files that no other note in the app shows
 */
import { collectImages, collectMedia, ParseOptions } from "./markdown";

/** What mediaNames.ts calls a saved file: 14 digits (date and time), maybe "-2", then the extension. */
const APP_FILE = /^\d{14}(?:-\d+)?\.[a-z0-9]+$/i;

const baseName = (path: string) =>
	(path.split("/").pop() ?? path).toLowerCase();

/** Paths (from the vault folder) of the pictures, voice notes and videos a text embeds. */
function embeddedPaths(body: string, opts: ParseOptions): string[] {
	const out: string[] = [];
	for (const img of collectImages(body, opts))
		if (img.image.kind === "vault") out.push(img.image.path);
	for (const m of collectMedia(body, opts)) out.push(m.path);
	return out;
}

/** Vault paths to delete with a note, given the text of the note and of all the other notes. */
export function attachmentsToDelete(
	body: string,
	otherBodies: string[],
	opts: ParseOptions = { obsidian: true },
): string[] {
	// Obsidian finds a file by its name too, so another note counts as "using"
	// it when the name is the same, wherever the path says it lives.
	const usedElsewhere = new Set<string>();
	for (const other of otherBodies)
		for (const p of embeddedPaths(other, opts))
			usedElsewhere.add(baseName(p));

	const seen = new Set<string>();
	const out: string[] = [];
	for (const p of embeddedPaths(body, opts)) {
		const key = p.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		if (APP_FILE.test(baseName(p)) && !usedElsewhere.has(baseName(p)))
			out.push(p);
	}
	return out;
}
