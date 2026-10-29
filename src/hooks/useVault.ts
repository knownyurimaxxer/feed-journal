import { useCallback, useEffect, useMemo, useState } from "react";
import { buildVaultIndex } from "../storage/vault";
import { ObsidianApi, ObsidianStatus } from "../theme/ObsidianContext";
import { findInIndex, VaultIndex } from "../utils/vaultIndex";

/**
 * Keeps the list of pictures of the Obsidian vault. It is rebuilt when the
 * vault changes, when Obsidian compatibility is turned on, and on `refresh()`
 * (pull to refresh). While it is rebuilding, the previous list stays in use.
 */
export function useVault(enabled: boolean, vaultUri: string | null) {
	// index is null when the folder couldn't be read
	const [built, setBuilt] = useState<{
		uri: string;
		index: VaultIndex | null;
	} | null>(null);
	const [round, setRound] = useState(0);
	const uri = enabled ? vaultUri : null;

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

	const api = useMemo<ObsidianApi>(() => {
		const current = built && built.uri === uri ? built : null;
		const status: ObsidianStatus = !enabled
			? "off"
			: !uri
				? "no-vault"
				: !current
					? "indexing"
					: current.index
						? "ready"
						: "unreadable";
		const index = current?.index ?? null;
		return {
			enabled,
			status,
			resolveImage: (path) => (index ? findInIndex(index, path) : null),
		};
	}, [enabled, uri, built]);

	return { api, refresh };
}
