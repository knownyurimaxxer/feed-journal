import {
	ComponentProps,
	ComponentRef,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { MAX_TAG_LENGTH, MAX_TITLE } from "../constants";
import { MessageKey } from "../i18n";
import { useT } from "../i18n/I18nContext";
import { useObsidian } from "../theme/ObsidianContext";
import { useTheme } from "../theme/ThemeContext";
import { Draft, Note, Selection, Theme } from "../types";
import { readableOn } from "../utils/format";
import { fitToLimit, visibleLength } from "../utils/limits";
import { collectImages } from "../utils/markdown";
import {
	EditResult,
	toggleCodeBlock,
	toggleImage,
	toggleLinePrefix,
	toggleLink,
	toggleTaskAtTap,
	toggleWrap,
} from "../utils/markdownEdit";
import { cleanTitle, normalizeTag } from "../utils/noteText";
import Avatar from "./Avatar";
import LiveInput from "./LiveInput";
import PostImage from "./PostImage";

type Props = {
	visible: boolean;
	editing: Note | null;
	avatar: string | null;
	nickname: string | null;
	maxChars: number;
	maxTags: number;
	onClose: () => void;
	onSave: (draft: Draft) => void;
};

type Tool = {
	icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
	/** Text (see i18n) for the button's accessibility label. */
	label: MessageKey;
	run: (text: string, sel: Selection) => EditResult;
};

const TOOLS: Tool[] = [
	{
		icon: "format-bold",
		label: "tool.bold",
		run: (t, s) => toggleWrap(t, s, "**"),
	},
	{
		icon: "format-italic",
		label: "tool.italic",
		run: (t, s) => toggleWrap(t, s, "*"),
	},
	{
		icon: "format-strikethrough",
		label: "tool.strike",
		run: (t, s) => toggleWrap(t, s, "~~"),
	},
	{ icon: "link-variant", label: "tool.link", run: toggleLink },
	{ icon: "image-outline", label: "tool.image", run: toggleImage },
	{
		icon: "format-header-pound",
		label: "tool.heading",
		run: (t, s) => toggleLinePrefix(t, s, "heading"),
	},
	{
		icon: "format-quote-close",
		label: "tool.quote",
		run: (t, s) => toggleLinePrefix(t, s, "quote"),
	},
	{ icon: "code-braces", label: "tool.code", run: toggleCodeBlock },
	{
		icon: "format-list-bulleted",
		label: "tool.bullets",
		run: (t, s) => toggleLinePrefix(t, s, "bullet"),
	},
	{
		icon: "format-list-numbered",
		label: "tool.numbers",
		run: (t, s) => toggleLinePrefix(t, s, "ordered"),
	},
];

/** Only with Obsidian compatibility on. */
const TASK_TOOLS: Tool[] = [
	{
		icon: "format-list-checks",
		label: "tool.checklist",
		run: (t, s) => toggleLinePrefix(t, s, "task"),
	},
];

/** Mount with a `key` that changes per note so its state resets for each open. */
export default function Composer({
	visible,
	editing,
	avatar,
	nickname,
	maxChars,
	maxTags,
	onClose,
	onSave,
}: Props) {
	const theme = useTheme();
	const t = useT();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const { enabled: obsidian } = useObsidian();
	const opts = useMemo(() => ({ obsidian }), [obsidian]);
	const tools = useMemo(
		() => (obsidian ? [...TOOLS, ...TASK_TOOLS] : TOOLS),
		[obsidian],
	);

	const [title, setTitle] = useState(editing?.title ?? "");
	const [body, setBody] = useState(editing?.body ?? "");
	const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
	const [tagInput, setTagInput] = useState("");
	const [raw, setRaw] = useState(false); // false = live formatting, true = Markdown code
	const [bodyFocused, setBodyFocused] = useState(true);

	// `selection` tracks the cursor; `forced` pushes a new one into the input
	// after a toolbar action (and is dropped again as soon as it has been applied).
	const [selection, setSelection] = useState<Selection>({
		start: body.length,
		end: body.length,
	});
	const [forced, setForced] = useState<Selection | undefined>(undefined);
	const bodyRef = useRef<ComponentRef<typeof TextInput>>(null);
	const lastEdit = useRef(0); // when the text was last typed, to tell a tap from typing

	// Pictures in the text are shown under it once typing pauses (so a web
	// address isn't fetched letter by letter while it is being typed).
	const [previewText, setPreviewText] = useState(body);
	useEffect(() => {
		const timer = setTimeout(() => setPreviewText(body), 700);
		return () => clearTimeout(timer);
	}, [body]);
	const previews = useMemo(
		() => collectImages(previewText, opts),
		[previewText, opts],
	);

	// The limit counts what you can read: Markdown syntax (**, [](url), ...)
	// is free (see visibleLength). Lowering it never cuts a post you already
	// wrote: while editing, it can stay as long as it is (but can't grow past that).
	const used = useMemo(() => visibleLength(body, opts), [body, opts]);
	const startLength = useMemo(
		() => (editing ? visibleLength(editing.body, opts) : 0),
		[editing, opts],
	);
	const limit = Math.max(maxChars, startLength);
	const left = limit - used;
	// With tags set to 0 the box is hidden, unless this post already has some.
	const showTags = maxTags > 0 || tags.length > 0;
	const canPost = body.trim().length > 0;

	const applyTool = (tool: Tool) => {
		const r = tool.run(body, selection);
		// Toolbar edits don't go through the input, so enforce the limit here.
		const grows = visibleLength(r.text, opts) > used;
		if (grows && visibleLength(r.text, opts) > limit) return;
		lastEdit.current = Date.now();
		setBody(r.text);
		setSelection(r.selection);
		setForced(r.selection);
	};

	const commitTag = (rawTag: string) => {
		const tag = normalizeTag(rawTag, MAX_TAG_LENGTH);
		if (tag && !tags.includes(tag) && tags.length < maxTags) {
			setTags([...tags, tag]);
		}
		setTagInput("");
	};

	const onTagChange = (v: string) => {
		// A space or comma finishes the tag.
		if (/[,\s]$/.test(v)) commitTag(v);
		else setTagInput(v);
	};

	const handleSave = () => {
		const pending = normalizeTag(tagInput, MAX_TAG_LENGTH);
		const finalTags =
			pending && !tags.includes(pending) && tags.length < maxTags
				? [...tags, pending]
				: tags;
		onSave({
			title: cleanTitle(title),
			body: body.trim(),
			tags: finalTags,
		});
	};

	const onBg = readableOn(theme.background);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			statusBarTranslucent
			onRequestClose={onClose}
			supportedOrientations={["portrait", "landscape"]}
		>
			<SafeAreaView style={s.root}>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					// "padding" on Android too: without it nothing lifts the toolbar
					// above the keyboard (Android no longer resizes the window for us).
					behavior="padding"
				>
					<View style={s.header}>
						<Pressable onPress={onClose} hitSlop={10}>
							<Ionicons name="close" size={26} color={onBg} />
						</Pressable>

						<View style={s.identity}>
							<Avatar avatar={avatar} size={28} />
							{nickname && (
								<Text style={s.handle} numberOfLines={1}>
									{nickname}
								</Text>
							)}
						</View>

						<Text
							style={[
								s.counter,
								left <= 20 && { color: "#FF4D4D" },
							]}
						>
							{left}
						</Text>
						<Pressable
							onPress={() => {
								setRaw((r) => !r);
								setForced(undefined);
							}}
							hitSlop={10}
							accessibilityLabel={
								raw
									? t("composer.showLive")
									: t("composer.showMarkdown")
							}
							style={[s.codeToggle, raw && s.codeToggleOn]}
						>
							<Ionicons
								name="code-slash"
								size={20}
								color={raw ? readableOn(theme.accent) : onBg}
							/>
						</Pressable>
						<Pressable
							disabled={!canPost}
							style={[s.postBtn, !canPost && { opacity: 0.4 }]}
							onPress={handleSave}
						>
							<Text style={s.postBtnText}>
								{editing
									? t("composer.save")
									: t("composer.post")}
							</Text>
						</Pressable>
					</View>

					<ScrollView
						style={s.card}
						contentContainerStyle={s.cardContent}
						keyboardShouldPersistTaps="handled"
					>
						<TextInput
							style={s.titleInput}
							placeholder={t("composer.titlePlaceholder")}
							placeholderTextColor={theme.text + "77"}
							value={title}
							onChangeText={setTitle}
							maxLength={MAX_TITLE}
							returnKeyType="next"
							onSubmitEditing={() => bodyRef.current?.focus()}
							submitBehavior="submit"
						/>

						<LiveInput
							inputRef={bodyRef}
							value={body}
							raw={raw}
							focused={bodyFocused}
							selection={selection}
							forcedSelection={forced}
							placeholder={t("composer.bodyPlaceholder")}
							onChangeText={(v) => {
								lastEdit.current = Date.now();
								// Over the limit: what was just typed or pasted is cut to fit.
								setBody((prev) =>
									fitToLimit(prev, v, limit, opts),
								);
								setForced(undefined);
							}}
							onSelectionChange={(sel) => {
								// With Obsidian compatibility on, tapping a checklist box
								// ticks it (not in the Markdown view, and never right after typing).
								const tapped =
									obsidian &&
									!raw &&
									Date.now() - lastEdit.current > 300
										? toggleTaskAtTap(body, selection, sel)
										: null;
								if (tapped) {
									lastEdit.current = Date.now();
									setBody(tapped.text);
									setSelection(tapped.selection);
									setForced(tapped.selection);
									return;
								}
								setSelection(sel);
								setForced((f) =>
									f &&
									f.start === sel.start &&
									f.end === sel.end
										? undefined
										: f,
								);
							}}
							onFocus={() => setBodyFocused(true)}
							onBlur={() => setBodyFocused(false)}
						/>

						{!raw && previews.length > 0 && (
							<View style={s.previews}>
								{previews.map((img, i) => (
									<PostImage key={`${i}`} image={img} />
								))}
							</View>
						)}

						{showTags && (
							<View style={s.tagRow}>
								<Ionicons
									name="pricetag-outline"
									size={16}
									color={theme.text + "99"}
								/>
								{tags.map((tag) => (
									<Pressable
										key={tag}
										style={s.tagChip}
										onPress={() =>
											setTags(
												tags.filter((x) => x !== tag),
											)
										}
										accessibilityLabel={t(
											"composer.removeTag",
											{ tag },
										)}
									>
										<Text style={s.tagChipText}>
											#{tag}
										</Text>
										<Ionicons
											name="close"
											size={14}
											color={theme.accent}
										/>
									</Pressable>
								))}
								{tags.length < maxTags && (
									<TextInput
										style={s.tagInput}
										placeholder={
											tags.length
												? t("composer.tagAddAnother")
												: t("composer.tagAdd")
										}
										placeholderTextColor={theme.text + "77"}
										value={tagInput}
										onChangeText={onTagChange}
										onSubmitEditing={() =>
											commitTag(tagInput)
										}
										submitBehavior="submit"
										autoCapitalize="none"
										autoCorrect={false}
										returnKeyType="done"
										maxLength={MAX_TAG_LENGTH + 1}
									/>
								)}
							</View>
						)}
					</ScrollView>

					{bodyFocused && (
						<View style={s.toolbar}>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								keyboardShouldPersistTaps="always"
								contentContainerStyle={s.toolbarRow}
							>
								{tools.map((tool) => (
									<Pressable
										key={tool.label}
										style={({ pressed }) => [
											s.tool,
											pressed && s.toolPressed,
										]}
										onPress={() => applyTool(tool)}
										accessibilityLabel={t(tool.label)}
									>
										<MaterialCommunityIcons
											name={tool.icon}
											size={22}
											color={onBg}
										/>
									</Pressable>
								))}
							</ScrollView>
						</View>
					)}
				</KeyboardAvoidingView>
			</SafeAreaView>
		</Modal>
	);
}

const makeStyles = (t: Theme) => {
	const onBg = readableOn(t.background);
	return StyleSheet.create({
		root: { flex: 1, backgroundColor: t.background },
		header: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			paddingHorizontal: 14,
			paddingVertical: 10,
		},
		identity: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		handle: { color: onBg, fontWeight: "700", fontSize: 14, flexShrink: 1 },
		counter: { color: onBg, opacity: 0.7, fontSize: 14, fontWeight: "600" },
		codeToggle: {
			width: 34,
			height: 34,
			borderRadius: 17,
			alignItems: "center",
			justifyContent: "center",
		},
		codeToggleOn: { backgroundColor: t.accent },
		postBtn: {
			backgroundColor: t.accent,
			paddingHorizontal: 20,
			paddingVertical: 8,
			borderRadius: 18,
		},
		postBtnText: {
			color: readableOn(t.accent),
			fontWeight: "800",
			fontSize: 15,
		},
		card: {
			flex: 1,
			backgroundColor: t.card,
			borderRadius: 8,
			marginHorizontal: 8,
			marginBottom: 6,
		},
		cardContent: { padding: 12, flexGrow: 1 },
		titleInput: {
			color: t.text,
			fontSize: 18,
			fontWeight: "800",
			paddingVertical: 4,
			marginBottom: 4,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: t.text + "33",
		},
		previews: { marginTop: 8, gap: 4 },
		tagRow: {
			flexDirection: "row",
			flexWrap: "wrap",
			alignItems: "center",
			gap: 8,
			marginTop: 8,
			paddingTop: 8,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: t.text + "33",
		},
		tagChip: {
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
			paddingHorizontal: 10,
			paddingVertical: 3,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: t.accent,
		},
		tagChipText: { color: t.accent, fontWeight: "600", fontSize: 13 },
		tagInput: {
			color: t.text,
			fontSize: 14,
			minWidth: 100,
			paddingVertical: 4,
		},
		toolbar: {
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: onBg + "33",
		},
		toolbarRow: { paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
		tool: {
			width: 44,
			height: 40,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 8,
		},
		toolPressed: { backgroundColor: onBg + "22" },
	});
};
