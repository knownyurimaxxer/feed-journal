import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildVaultIndex } from "../storage/vault";
import { ObsidianApi, ObsidianStatus } from "../theme/ObsidianContext";
import {
	addToIndex,
	findInIndex,
	isObsidianActive,
	VaultIndex,
} from "../utils/vaultIndex";

/**
 * Keeps the list of pictures of the Obsidian vault. It is rebuilt when the
 * vault changes, when Obsidian is turned on, and on `refresh()` (pull to
 * refresh). Obsidian only counts as active when it is turned on AND a vault
 * folder is chosen; otherwise nothing Obsidian-related works. While it is rebuilding, the previous list stays in use.
 */
export function useVault(enabled: boolean, vaultUri: string | null) {
	// index is null when the folder couldn't be read
	const [built, setBuilt] = useState<{
		uri: string;
		index: VaultIndex | null;
	} | null>(null);
	const [round, setRound] = useState(0);
	const [added, setAdded] = useState(0); // counts files the app saved itself
	const active = isObsidianActive(enabled, vaultUri);
	const uri = active ? vaultUri : null;

	useEffect(() => {
		if (!uri) {
			setBuilt(null);
			return;
		}
		let cancelled = false;
		buildVaultIndex(uri)
			.then((index) => !cancelled && setBuilt({ uri, index }))
			.catch((e) => {
				console.warn("Could not read the vault", e);
				if (!cancelled) setBuilt({ uri, index: null });
			});
		return () => {
			cancelled = true;
		};
	}, [uri, round]);

	const refresh = useCallback(() => setRound((n) => n + 1), []);

	// Files the app saves into the vault are added to the list directly.
	const indexRef = useRef<VaultIndex | null>(null);
	indexRef.current = built && built.uri === uri ? built.index : null;
	const registerFile = useCallback((path: string, fileUri: string) => {
		if (!indexRef.current) return;
		addToIndex(indexRef.current, path, fileUri);
		setAdded((n) => n + 1);
	}, []);

	const api = useMemo<ObsidianApi>(() => {
		const current = built && built.uri === uri ? built : null;
		const status: ObsidianStatus = !uri
			? "off"
			: !current
				? "indexing"
				: current.index
					? "ready"
					: "unreadable";
		const index = current?.index ?? null;
		return {
			enabled: active,
			status,
			resolveImage: (path) => (index ? findInIndex(index, path) : null),
			registerFile,
		};
		// `added` makes a new object when the list grew, so pictures look again.
	}, [active, uri, built, registerFile, added]);

	return { api, refresh };
}
