import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, LIMITS } from "../constants";
import { getAllSettings, resetDb, setSetting } from "../storage/db";
import { Settings, UpdateSetting } from "../types";
import { clampLimit } from "../utils/limits";

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			const saved = await getAllSettings();
			const get = <T>(key: string, fallback: T): T =>
				key in saved ? (saved[key] as T) : fallback;
			const theme = get("theme", DEFAULT_SETTINGS.theme);
			const likesEnabled = get(
				"likesEnabled",
				DEFAULT_SETTINGS.likesEnabled,
			);
			const folderUri = get<string | null>(
				"folderUri",
				DEFAULT_SETTINGS.folderUri,
			);
			const avatarEnabled = get(
				"avatarEnabled",
				DEFAULT_SETTINGS.avatarEnabled,
			);
			const avatar = get("avatar", DEFAULT_SETTINGS.avatar);
			const avatarImage = get<string | null>(
				"avatarImage",
				DEFAULT_SETTINGS.avatarImage,
			);
			const nicknameEnabled = get(
				"nicknameEnabled",
				DEFAULT_SETTINGS.nicknameEnabled,
			);
			const nickname = get("nickname", DEFAULT_SETTINGS.nickname);
			const maxChars = get("maxChars", DEFAULT_SETTINGS.maxChars);
			const maxTags = get("maxTags", DEFAULT_SETTINGS.maxTags);
			const obsidianEnabled = get(
				"obsidianEnabled",
				DEFAULT_SETTINGS.obsidianEnabled,
			);
			const vaultUri = get<string | null>(
				"vaultUri",
				DEFAULT_SETTINGS.vaultUri,
			);
			const language = get("language", DEFAULT_SETTINGS.language);
			setSettings({
				theme: { ...DEFAULT_SETTINGS.theme, ...theme },
				likesEnabled,
				folderUri,
				avatarEnabled,
				avatar: avatar === "initial" ? "person" : avatar, // 'initial' no longer exists
				avatarImage,
				nicknameEnabled,
				nickname,
				maxChars: clampLimit(
					maxChars,
					LIMITS.chars.min,
					LIMITS.chars.max,
					LIMITS.chars.default,
				),
				maxTags: clampLimit(
					maxTags,
					LIMITS.tags.min,
					LIMITS.tags.max,
					LIMITS.tags.default,
				),
				obsidianEnabled,
				vaultUri,
				language,
			});
			setReady(true);
		})();
	}, []);

	const update: UpdateSetting = useCallback((key, value) => {
		setSettings((s) => ({ ...s, [key]: value }));
		setSetting(key, value).catch((e) =>
			console.warn("Could not save setting", key, e),
		);
	}, []);

	/** Empties the db (likes, dates, settings) and puts every setting back to its default. */
	const reset = useCallback(async () => {
		await resetDb();
		setSettings(DEFAULT_SETTINGS);
	}, []);

	return { settings, ready, update, reset };
}
