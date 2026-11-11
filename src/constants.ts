import type { MessageKey } from "./i18n/locales/en";
import { MediaFolders, MediaQuality, Settings, Theme } from "./types";

/**
 * What the user can set in Settings: characters per post and tags per post.
 * The title and the length of a single tag have fixed limits.
 */
export const LIMITS = {
	chars: { min: 10, max: 5000, default: 280 },
	tags: { min: 0, max: 30, default: 10 },
} as const;
export const MAX_TITLE = 60;
export const MAX_TAG_LENGTH = 24;

export const PRESETS: Record<string, Theme> = {
	Navy: {
		background: "#001935",
		card: "#FFFFFF",
		text: "#222222",
		accent: "#00B8FF",
	},
	Midnight: {
		background: "#0D0D0F",
		card: "#1C1C21",
		text: "#EDEDED",
		accent: "#FF6B9D",
	},
	Paper: {
		background: "#F2EFE9",
		card: "#FFFFFF",
		text: "#2B2B2B",
		accent: "#E4572E",
	},
	Forest: {
		background: "#12251B",
		card: "#1D3A2A",
		text: "#E6F2E9",
		accent: "#9BE564",
	},
	Grape: {
		background: "#2A1B3D",
		card: "#3D2A57",
		text: "#F3E8FF",
		accent: "#FFD166",
	},
};

export const SWATCHES: Record<keyof Theme, string[]> = {
	background: [
		"#001935",
		"#0D0D0F",
		"#12251B",
		"#2A1B3D",
		"#F2EFE9",
		"#1B2A41",
		"#3B1F2B",
		"#FFFFFF",
	],
	card: [
		"#FFFFFF",
		"#1C1C21",
		"#1D3A2A",
		"#3D2A57",
		"#FFF7E6",
		"#24385C",
		"#4A2838",
		"#F0F0F0",
	],
	text: [
		"#222222",
		"#EDEDED",
		"#E6F2E9",
		"#F3E8FF",
		"#2B2B2B",
		"#FFFFFF",
		"#FFD9A0",
		"#000000",
	],
	accent: [
		"#00B8FF",
		"#FF6B9D",
		"#E4572E",
		"#9BE564",
		"#FFD166",
		"#B388FF",
		"#FF8A00",
		"#00E5A8",
	],
};

/** Texts (see i18n) for the color rows in Settings. */
export const ROLE_LABELS: Record<keyof Theme, MessageKey> = {
	background: "role.background",
	card: "role.card",
	text: "role.text",
	accent: "role.accent",
};

/** Texts (see i18n) for the preset names. A preset without one shows its own name. */
export const PRESET_LABELS: Record<string, MessageKey> = {
	Navy: "preset.navy",
	Midnight: "preset.midnight",
	Paper: "preset.paper",
	Forest: "preset.forest",
	Grape: "preset.grape",
};

/** Every moment the app can vibrate. Each one has its own switch in Settings. */
export const HAPTIC_TRIGGERS = [
	"done",
	"save",
	"cancel",
	"menu",
	"action",
	"settings",
	"refresh",
	"compose",
	"checklist",
	"tag",
	"delete",
	"error",
] as const;
export type HapticTrigger = (typeof HAPTIC_TRIGGERS)[number];

/**
 * Steps of the vibration-strength slider. 0 is the softest (and the default);
 * the top step is the app's original vibration.
 */
export const HAPTIC_STRENGTH = { min: 0, max: 5, default: 0 } as const;

/** Where new pictures, voice notes and screen recordings go in the vault (until changed in Settings). */
export const DEFAULT_MEDIA_FOLDERS: MediaFolders = {
	image: "Attachments/Images",
	audio: "Attachments/Audio",
	video: "Attachments/Video",
};

/** The choices offered in Settings for voice notes and screen recordings. */
export const MEDIA_QUALITY_CHOICES = {
	audioChannels: [1, 2] as const,
	audioKbps: [32, 64, 96, 128, 192] as const,
	screenCodec: ["h264", "hevc"] as const,
	screenMbps: [1, 2, 4, 8] as const,
};

export const DEFAULT_MEDIA_QUALITY: MediaQuality = {
	audioChannels: 1,
	audioKbps: 64,
	screenCodec: "h264",
	screenMbps: 2,
};

export const DEFAULT_SETTINGS: Settings = {
	theme: PRESETS["Navy"],
	likesEnabled: true,
	avatarEnabled: true,
	avatar: "person",
	avatarImage: null,
	nicknameEnabled: true,
	nickname: "User",
	folderUri: null,
	maxChars: LIMITS.chars.default,
	maxTags: LIMITS.tags.default,
	obsidianEnabled: false,
	vaultUri: null,
	deleteAttachments: false,
	mediaFolders: DEFAULT_MEDIA_FOLDERS,
	mediaQuality: DEFAULT_MEDIA_QUALITY,
	language: "system",
	hapticsEnabled: false,
	haptics: Object.fromEntries(
		HAPTIC_TRIGGERS.map((k) => [k, true]),
	) as Record<HapticTrigger, boolean>,
	hapticLevel: HAPTIC_STRENGTH.default,
};

export const AVATAR_ICONS = [
	"person",
	"happy",
	"sad",
	"skull",
	"paw",
	"flame",
	"planet",
	"leaf",
	"moon",
	"rocket",
	"bug",
	"eye",
] as const;

export const LINKS = {
	ideaPost:
		"https://www.tumblr.com/rubensmuse/831592820192280576/killer-new-startup-idea-phone-app-called-the",
	ideaSocial: "https://www.tumblr.com/rubensmuse",
	developer: "https://www.tumblr.com/knownyurimaxxer",
	kofi: "https://ko-fi.com/knownyurimaxxer",
	ionicons: "https://ionic.io/ionicons",
	ionic: "https://ionic.io/",
	mdi: "https://pictogrammers.com/library/mdi/",
	pictogrammers: "https://pictogrammers.com/",
} as const;
