/**
 * Note file format (Obsidian style). The title is NOT stored in the file,
 * it is the file name. Tags go in a front matter block at the top:
 *
 *   ---
 *   tags: [one, two]
 *   ---
 *   the note text...
 *
 * The block only exists when there is something to put in it.
 */

const FRONT_MATTER =
	/^---[ \t]*\n(?:([\s\S]*?)\n)?(?:---|\.\.\.)[ \t]*(?:\n|$)/;
const DEFAULT_NAME = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(?:_[a-z0-9]{1,6})?$/;

export type ParsedNote = {
	body: string;
	tags: string[];
	/** Other front matter lines (e.g. from Obsidian), kept untouched when saving. */
	extra: string[];
};

/** Splits file text into the body, the tags and any other front matter lines. */
export function parseNote(text: string): ParsedNote {
	const normalized = text.replace(/\r\n?/g, "\n");
	const m = normalized.match(FRONT_MATTER);
	if (!m) return { body: normalized, tags: [], extra: [] };

	const lines = (m[1] ?? "").split("\n");
	const tags: string[] = [];
	const extra: string[] = [];
	for (let i = 0; i < lines.length; i++) {
		const key = lines[i].match(/^tags[ \t]*:(.*)$/);
		if (!key) {
			if (lines[i].trim() !== "") extra.push(lines[i]);
			continue;
		}
		const rest = key[1].trim();
		if (rest) {
			// tags: [a, b]   or   tags: a, b
			tags.push(...splitTags(rest));
		} else {
			// tags:
			//   - a
			//   - b
			while (
				i + 1 < lines.length &&
				/^[ \t]*-[ \t]+\S/.test(lines[i + 1])
			) {
				const item = lines[++i].replace(/^[ \t]*-[ \t]+/, "");
				const tag = normalizeTag(item.replace(/^["']|["']$/g, ""), 64);
				if (tag) tags.push(tag);
			}
		}
	}
	return {
		body: normalized.slice(m[0].length).replace(/^\n+/, ""),
		tags: Array.from(new Set(tags)),
		extra,
	};
}

/** Builds the file text. No tags and no extra lines means no front matter at all. */
export function composeNote(
	body: string,
	tags: string[],
	extra: string[] = [],
): string {
	const lines = [
		...(tags.length ? [`tags: [${tags.join(", ")}]`] : []),
		...extra,
	];
	return lines.length ? `---\n${lines.join("\n")}\n---\n${body}` : body;
}

function splitTags(raw: string): string[] {
	return raw
		.replace(/^\[|\]$/g, "")
		.split(/[,\s]+/)
		.map((t) => normalizeTag(t.replace(/^["']|["']$/g, ""), 64))
		.filter(Boolean);
}

/** True for the date/time names the app gives to notes without a title. */
export function isDefaultName(id: string): boolean {
	return DEFAULT_NAME.test(id);
}

/** The note's title is its file name, unless that is a default date/time name. */
export function titleFromId(id: string): string | null {
	return isDefaultName(id) ? null : id;
}

/** Single line, collapsed whitespace. */
export function cleanTitle(raw: string): string {
	return raw.replace(/\s+/g, " ").trim();
}

/** File name (without .md) for a title, or null if nothing usable is left. */
export function fileNameFromTitle(title: string): string | null {
	const name = cleanTitle(title)
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
		.replace(/^\.+/, "")
		.slice(0, 80)
		.replace(/[ .]+$/, "")
		.trim();
	return name || null;
}

/** `taken` holds lower-case names already in use (file systems are often case-insensitive). */
export function uniqueName(base: string, taken: Set<string>): string {
	let name = base;
	let n = 2;
	while (taken.has(name.toLowerCase())) name = `${base} (${n++})`;
	return name;
}

/** Lower-case, no leading #, spaces become dashes. Empty string if nothing is left. */
export function normalizeTag(raw: string, maxLength = 24): string {
	return raw
		.trim()
		.replace(/^#+/, "")
		.replace(/,+/g, "")
		.replace(/\s+/g, "-")
		.toLowerCase()
		.slice(0, maxLength);
}
