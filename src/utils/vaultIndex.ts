/**
 * Lookup table for the pictures of an Obsidian vault. Obsidian lets a note
 * point at an image in several ways, and all of them have to find the file:
 *   ![[photo.png]]              just the name, wherever it is in the vault
 *   ![[Attachments/photo.png]]  the path from the vault folder
 *   ![[photos/photo.png]]       the end of the path ("Attachments/photos/photo.png")
 * Names are not case sensitive. When two folders hold the same name, the one
 * closest to the top of the vault wins.
 */
export type VaultIndex = {
	/** Lower-case path from the vault folder ("attachments/photo.png") -> file URI. */
	paths: Map<string, string>;
	/** Lower-case file name -> file URI of the shallowest file with that name. */
	names: Map<string, { depth: number; uri: string }>;
};

export function createIndex(): VaultIndex {
	return { paths: new Map(), names: new Map() };
}

/** `path` is relative to the vault folder, with "/" between folders. */
export function addToIndex(index: VaultIndex, path: string, uri: string): void {
	const lower = path.toLowerCase();
	index.paths.set(lower, uri);
	const parts = lower.split("/");
	const name = parts[parts.length - 1];
	const depth = parts.length;
	const known = index.names.get(name);
	if (!known || depth < known.depth) index.names.set(name, { depth, uri });
}

/** The file URI an image reference points to, or null when the vault has no such picture. */
export function findInIndex(index: VaultIndex, ref: string): string | null {
	const clean = ref
		.replace(/\\/g, "/")
		.replace(/^(?:\.\/|\/)+/, "")
		.trim()
		.toLowerCase();
	if (!clean) return null;

	if (!clean.includes("/")) return index.names.get(clean)?.uri ?? null;

	const exact = index.paths.get(clean);
	if (exact) return exact;
	// Only the end of the path was written.
	let best: { depth: number; uri: string } | null = null;
	for (const [path, uri] of index.paths) {
		if (!path.endsWith("/" + clean)) continue;
		const depth = path.split("/").length;
		if (!best || depth < best.depth) best = { depth, uri };
	}
	return best?.uri ?? null;
}
