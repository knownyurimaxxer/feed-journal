import { useCallback, useEffect, useState } from "react";
import {
	DEFAULT_MEDIA_FOLDERS,
	DEFAULT_MEDIA_QUALITY,
	DEFAULT_SETTINGS,
	HAPTIC_STRENGTH,
	LIMITS,
	MEDIA_QUALITY_CHOICES,
} from "../constants";
import { getAllSettings, resetDb, setSetting } from "../storage/db";
import { Settings, UpdateSetting } from "../types";
import { clampLimit, pickAllowed } from "../utils/limits";

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
			const deleteAttachments = get(
				"deleteAttachments",
				DEFAULT_SETTINGS.deleteAttachments,
			);
			const savedFolders = get<unknown>("mediaFolders", null);
			const savedQuality = get<Record<string, unknown> | null>(
				"mediaQuality",
				null,
			);
			const language = get("language", DEFAULT_SETTINGS.language);
			const hapticsEnabled = get(
				"hapticsEnabled",
				DEFAULT_SETTINGS.hapticsEnabled,
			);
			const savedHaptics = get<unknown>("haptics", null);
			const hapticLevel = get<unknown>(
				"hapticLevel",
				DEFAULT_SETTINGS.hapticLevel,
			);
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
				deleteAttachments,
				// A folder missing from an older save keeps its default.
				mediaFolders: {
					...DEFAULT_MEDIA_FOLDERS,
					...(savedFolders && typeof savedFolders === "object"
						? savedFolders
						: {}),
				},
				// Each choice must still be one Settings offers; otherwise its default.
				mediaQuality: {
					audioChannels: pickAllowed(
						savedQuality?.audioChannels,
						MEDIA_QUALITY_CHOICES.audioChannels,
						DEFAULT_MEDIA_QUALITY.audioChannels,
					),
					audioKbps: pickAllowed(
						savedQuality?.audioKbps,
						MEDIA_QUALITY_CHOICES.audioKbps,
						DEFAULT_MEDIA_QUALITY.audioKbps,
					),
					screenCodec: pickAllowed(
						savedQuality?.screenCodec,
						MEDIA_QUALITY_CHOICES.screenCodec,
						DEFAULT_MEDIA_QUALITY.screenCodec,
					),
					screenMbps: pickAllowed(
						savedQuality?.screenMbps,
						MEDIA_QUALITY_CHOICES.screenMbps,
						DEFAULT_MEDIA_QUALITY.screenMbps,
					),
				},
				language,
				hapticsEnabled,
				// A trigger added in a later version starts on, like the others.
				haptics: {
					...DEFAULT_SETTINGS.haptics,
					...(savedHaptics && typeof savedHaptics === "object"
						? savedHaptics
						: {}),
				},
				hapticLevel: clampLimit(
					hapticLevel,
					HAPTIC_STRENGTH.min,
					HAPTIC_STRENGTH.max,
					HAPTIC_STRENGTH.default,
				),
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
