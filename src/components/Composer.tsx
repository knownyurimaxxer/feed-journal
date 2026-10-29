import { ComponentProps, ComponentRef, useMemo, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
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
import { useTheme } from "../theme/ThemeContext";
import { Draft, Note, Selection, Theme } from "../types";
import { readableOn } from "../utils/format";
import {
	EditResult,
	toggleCodeBlock,
	toggleLinePrefix,
	toggleWrap,
} from "../utils/markdownEdit";
import { cleanTitle, normalizeTag } from "../utils/noteText";
import Avatar from "./Avatar";
import LiveInput from "./LiveInput";

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
	label: string;
	run: (text: string, sel: Selection) => EditResult;
};

const TOOLS: Tool[] = [
	{
		icon: "format-bold",
		label: "Bold",
		run: (t, s) => toggleWrap(t, s, "**"),
	},
	{
		icon: "format-italic",
		label: "Italic",
		run: (t, s) => toggleWrap(t, s, "*"),
	},
	{
		icon: "format-strikethrough",
		label: "Strikethrough",
		run: (t, s) => toggleWrap(t, s, "~~"),
	},
	{
		icon: "format-header-pound",
		label: "Heading",
		run: (t, s) => toggleLinePrefix(t, s, "heading"),
	},
	{
		icon: "format-quote-close",
		label: "Quote",
		run: (t, s) => toggleLinePrefix(t, s, "quote"),
	},
	{ icon: "code-braces", label: "Code block", run: toggleCodeBlock },
	{
		icon: "format-list-bulleted",
		label: "Bulleted list",
		run: (t, s) => toggleLinePrefix(t, s, "bullet"),
	},
	{
		icon: "format-list-numbered",
		label: "Numbered list",
		run: (t, s) => toggleLinePrefix(t, s, "ordered"),
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
	const s = useMemo(() => makeStyles(theme), [theme]);

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

	// Lowering the limit never cuts a post you already wrote: while editing,
	// it can stay as long as it is (but can't grow past that).
	const limit = Math.max(maxChars, editing?.body.length ?? 0);
	const left = limit - body.length;
	// With tags set to 0 the box is hidden, unless this post already has some.
	const showTags = maxTags > 0 || tags.length > 0;
	const canPost = body.trim().length > 0;

	const applyTool = (tool: Tool) => {
		const r = tool.run(body, selection);
		// Toolbar edits bypass the input's maxLength, so enforce the limit here.
		if (r.text.length > limit && r.text.length > body.length) return;
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
			onRequestClose={onClose}
			supportedOrientations={["portrait", "landscape"]}
		>
			<SafeAreaView style={s.root}>
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : undefined}
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
									? "Switch to live formatting"
									: "Show Markdown code"
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
								{editing ? "Save" : "Post"}
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
							placeholder="Title (optional)"
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
							maxLength={limit}
							placeholder="What's on your mind? (no one will see this)"
							onChangeText={(v) => {
								setBody(v);
								setForced(undefined);
							}}
							onSelectionChange={(sel) => {
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
										accessibilityLabel={`Remove tag ${tag}`}
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
												? "Add another"
												: "Add a tag"
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
								{TOOLS.map((tool) => (
									<Pressable
										key={tool.label}
										style={({ pressed }) => [
											s.tool,
											pressed && s.toolPressed,
										]}
										onPress={() => applyTool(tool)}
										accessibilityLabel={tool.label}
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
