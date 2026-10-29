import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, LIMITS } from "../constants";
import { getSetting, resetDb, setSetting } from "../storage/db";
import { Settings, UpdateSetting } from "../types";
import { clampLimit } from "../utils/limits";

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		(async () => {
			const [
				theme,
				likesEnabled,
				folderUri,
				avatarEnabled,
				avatar,
				avatarImage,
				nicknameEnabled,
				nickname,
				maxChars,
				maxTags,
				obsidianEnabled,
				vaultUri,
			] = await Promise.all([
				getSetting("theme", DEFAULT_SETTINGS.theme),
				getSetting("likesEnabled", DEFAULT_SETTINGS.likesEnabled),
				getSetting<string | null>(
					"folderUri",
					DEFAULT_SETTINGS.folderUri,
				),
				getSetting("avatarEnabled", DEFAULT_SETTINGS.avatarEnabled),
				getSetting("avatar", DEFAULT_SETTINGS.avatar),
				getSetting<string | null>(
					"avatarImage",
					DEFAULT_SETTINGS.avatarImage,
				),
				getSetting("nicknameEnabled", DEFAULT_SETTINGS.nicknameEnabled),
				getSetting("nickname", DEFAULT_SETTINGS.nickname),
				getSetting("maxChars", DEFAULT_SETTINGS.maxChars),
				getSetting("maxTags", DEFAULT_SETTINGS.maxTags),
				getSetting("obsidianEnabled", DEFAULT_SETTINGS.obsidianEnabled),
				getSetting<string | null>(
					"vaultUri",
					DEFAULT_SETTINGS.vaultUri,
				),
			]);
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
