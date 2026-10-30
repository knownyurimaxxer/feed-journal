/**
 * English: the master list of every text in the app. Other languages are
 * typed against it (see es.ts), so a missing or misspelled key is a compile
 * error. Texts can hold {placeholders}, filled in by the code that uses them.
 * To add a language: copy this file to xx.ts, translate the values, and add one
 * line to LANGUAGES in ../index.ts. Don't translate the keys or the {placeholders}.
 */
export const en = {
	// shared
	"common.cancel": "Cancel",
	"common.continue": "Continue",
	"common.delete": "Delete",
	"common.done": "Done",
	"common.edit": "Edit",

	// feed
	"feed.search": "Search your posts",
	"feed.all": "All",
	"feed.empty": "Nothing here yet.\nGo overshare. Nobody's watching.",
	"feed.noMatch": "No posts match that.",
	"feed.fallbackBanner":
		"Can't access your notes folder, so app storage is in use. Tap to choose a folder again.",
	"feed.you": "you",
	"feed.deleteTitle": "Delete this post?",
	"feed.deleteBody": "The .md file will be deleted. (Nobody saw it anyway.)",
	"feed.resetTitle": "Delete everything?",
	"feed.resetBody":
		"This permanently deletes every note in your notes folder, plus all likes and settings, and resets the app. This can't be undone.",
	"feed.resetSureTitle": "Are you absolutely sure?",
	"feed.resetSureBody": "Every note will be deleted.",
	"feed.resetSureConfirm": "Delete everything",
	"feed.resetFailed": "Couldn't reset",

	// post card
	"post.edited": " · edited",
	"time.now": "just now",
	"time.minutes": "{n}m",
	"time.hours": "{n}h",
	"time.days": "{n}d",

	// composer
	"composer.titlePlaceholder": "Title (optional)",
	"composer.bodyPlaceholder": "What's on your mind? (no one will see this)",
	"composer.tagAdd": "Add a tag",
	"composer.tagAddAnother": "Add another",
	"composer.removeTag": "Remove tag {tag}",
	"composer.post": "Post",
	"composer.save": "Save",
	"composer.showMarkdown": "Show Markdown code",
	"composer.showLive": "Switch to live formatting",
	"tool.bold": "Bold",
	"tool.italic": "Italic",
	"tool.strike": "Strikethrough",
	"tool.link": "Link",
	"tool.image": "Image",
	"tool.heading": "Heading",
	"tool.quote": "Quote",
	"tool.code": "Code block",
	"tool.bullets": "Bulleted list",
	"tool.numbers": "Numbered list",
	"tool.checklist": "Checklist",

	// images and links in posts
	"image.needVault":
		"Choose your vault folder in Settings to show this image.",
	"image.vaultUnreadable":
		"The vault folder can't be opened. Choose it again in Settings.",
	"image.looking": "Looking for the image…",
	"image.notFound": "Image not found in the vault: {name}",
	"image.loadFailed": "Couldn't load the image.",
	"link.openFailed": "Couldn't open the link",

	// errors
	"error.savePost": "Couldn't save the post",
	"error.saveChanges": "Couldn't save the changes",
	"error.deletePost": "Couldn't delete the post",

	// settings
	"settings.title": "Settings",
	"settings.language": "Language",
	"settings.languageHint":
		"“System default” follows your phone's language, and uses English if your language isn't available.",
	"settings.languageSystem": "System default",
	"settings.folder": "Folder",
	"settings.folderHint":
		"Each post is saved as a .md file named after its title, with its tags at the top. Changing folders doesn't move existing notes.",
	"settings.chooseFolder": "Choose folder",
	"settings.useAppStorage": "Use app storage",
	"folder.appStorage": "App storage (default)",
	"settings.obsidian": "Obsidian compatibility",
	"settings.obsidianHint":
		"Shows images written as ![[photo.png]] from your vault, and turns “- [ ]” and “- [x]” lines into checkboxes you can tap (except in the Markdown view).",
	"settings.noVault": "No vault chosen",
	"settings.vaultHint":
		"Choose your Obsidian vault (the folder that holds the .obsidian folder). Images are looked up there by name or path. Nothing in the vault is changed.",
	"settings.clear": "Clear",
	"settings.user": "User",
	"settings.showNickname": "Show nickname",
	"settings.showNicknameHint": "Hides the name on posts and in the editor.",
	"settings.nicknamePlaceholder": "Nickname",
	"settings.showAvatar": "Show avatar",
	"settings.showAvatarHint": "Hides the avatar on posts and in the editor.",
	"settings.changePhoto": "Change photo",
	"settings.choosePhoto": "Choose photo",
	"settings.removePhoto": "Remove photo",
	"settings.ui": "UI",
	"settings.likes": "Fake likes",
	"settings.likesHint":
		"Off hides the counter and stops new likes. Existing counts are kept.",
	"settings.maxChars": "Characters per post",
	"settings.maxCharsHint":
		"From {min} to {max}. Posts you already wrote are never cut.",
	"settings.maxTags": "Tags per post",
	"settings.maxTagsHint":
		"From {min} to {max}. 0 hides the tag box when writing.",
	"settings.theme": "Theme",
	"settings.presets": "Presets",
	"role.background": "Background",
	"role.card": "Post card",
	"role.text": "Text",
	"role.accent": "Contrast / accent",
	"preset.navy": "Navy",
	"preset.midnight": "Midnight",
	"preset.paper": "Paper",
	"preset.forest": "Forest",
	"preset.grape": "Grape",
	"settings.reset": "Reset",
	"settings.resetHint":
		"Deletes every note in your notes folder, plus all likes and settings, and puts the app back the way it was on first launch. This can't be undone.",
	"settings.resetButton": "Delete all notes and reset app",

	// about
	"credits.about": "About",
	"credits.idea":
		"The idea for this app comes from {post} by {author} on Tumblr.",
	"credits.ideaPost": "this post",
	"credits.madeBy": "Made by {developer}.",
	"credits.icons": "{ionicons} by {ionic} and {mdi} by {pictogrammers}.",
	"credits.kofi": "If you ever feel like it, I have a Ko-fi page!",
} as const;

export type MessageKey = keyof typeof en;
/** What every language file must provide: all the keys, as plain text. */
export type Messages = Record<MessageKey, string>;
