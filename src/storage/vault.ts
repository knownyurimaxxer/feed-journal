/**
 * Reads an Obsidian vault folder (picked through the system folder picker)
 * to find its pictures. Nothing in the vault is ever written or changed.
 */
import { Directory, File } from "expo-file-system";
import { addToIndex, createIndex, VaultIndex } from "../utils/vaultIndex";
import { IMAGE_EXT } from "../utils/markdown";

const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0));

/**
 * Walks the vault (folders starting with "." such as .obsidian and .trash are
 * skipped) and remembers where every picture is. Throws when the folder can't
 * be opened. It lets the app breathe every few folders, so big vaults don't freeze it.
 */
export async function buildVaultIndex(uri: string): Promise<VaultIndex> {
	const root = new Directory(uri);
	if (!root.exists) throw new Error("The vault folder can't be opened");

	const index = createIndex();
	const queue: { dir: Directory; path: string }[] = [{ dir: root, path: "" }];
	let visited = 0;
	while (queue.length > 0) {
		const { dir, path } = queue.shift()!;
		let entries: (Directory | File)[] = [];
		try {
			entries = dir.list();
		} catch (e) {
			console.warn("Could not list", path || "vault root", e);
		}
		for (const entry of entries) {
			if (entry instanceof Directory) {
				if (!entry.name.startsWith("."))
					queue.push({ dir: entry, path: `${path}${entry.name}/` });
			} else if (IMAGE_EXT.test(entry.name)) {
				addToIndex(index, path + entry.name, entry.uri);
			}
		}
		if (++visited % 20 === 0) await yieldToUi();
	}
	return index;
}

const MIME: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	gif: "image/gif",
	webp: "image/webp",
	bmp: "image/bmp",
};

/**
 * Plan B for a picture the image view won't open from its folder address:
 * read the file ourselves and hand it over as a data address. `name` is only
 * used for its file extension.
 */
export async function readImageDataUri(
	uri: string,
	name: string,
): Promise<string | null> {
	try {
		const ext = name.split(".").pop()?.toLowerCase() ?? "";
		const base64 = await new File(uri).base64();
		return `data:${MIME[ext] ?? "image/jpeg"};base64,${base64}`;
	} catch (e) {
		console.warn("Could not read image", name, e);
		return null;
	}
}
