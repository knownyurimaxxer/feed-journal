export type Theme = {
	background: string;
	card: string;
	text: string;
	accent: string;
};

export type Settings = {
	theme: Theme;
	likesEnabled: boolean;
	avatarEnabled: boolean;
	/** An Ionicons name from AVATAR_ICONS, or 'photo' to use avatarImage. */
	avatar: string;
	/** URI of the photo avatar (copied into app storage), or null. */
	avatarImage: string | null;
	nicknameEnabled: boolean;
	nickname: string;
	/** URI of the user-chosen notes folder, or null for app-private storage. */
	folderUri: string | null;
	/** Most characters a post body can have (see LIMITS for the allowed range). */
	maxChars: number;
	/** Most tags a post can have (see LIMITS for the allowed range). */
	maxTags: number;
	/** Obsidian compatibility: ![[image]] embeds from the vault and - [ ] checklists. */
	obsidianEnabled: boolean;
	/** URI of the Obsidian vault folder (where embedded images are looked up), or null. */
	vaultUri: string | null;
};

export type UpdateSetting = <K extends keyof Settings>(
	key: K,
	value: Settings[K],
) => void;

/** What we read straight off disk: the .md file and nothing else. */
export type RawNote = {
	id: string; // file name without ".md"
	uri: string; // full URI of the file
	text: string; // the note text (the entire file content)
	createdAt: number; // file name date for default-named notes, else file mtime (the db keeps the real value)
	modifiedAt: number;
};

/** A note as the UI sees it: file data + title/body split + tags and likes from the internal db. */
export type Note = RawNote & {
	/** The file name, or null when the note has no name (a default date/time file name). */
	title: string | null;
	/** The note text without the front matter block. */
	body: string;
	/** Tags from the "tags:" line of the front matter. */
	tags: string[];
	/** Other front matter lines found in the file, kept untouched when saving. */
	extra: string[];
	likes: number;
};

/** What the editor hands back when saving. */
export type Draft = { title: string; body: string; tags: string[] };

/** Text-input selection range. */
export type Selection = { start: number; end: number };

/** Screen position of the element a popup menu is attached to. */
export type Anchor = { x: number; y: number; width: number; height: number };
