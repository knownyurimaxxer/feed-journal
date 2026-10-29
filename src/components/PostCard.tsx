import { ComponentRef, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { Anchor, Note, Theme } from "../types";
import { timeAgo } from "../utils/format";
import Avatar from "./Avatar";
import MarkdownText from "./MarkdownText";

type Props = {
	note: Note;
	showLikes: boolean;
	avatar: string | null;
	nickname: string | null;
	onMenu: (anchor: Anchor) => void;
	onTag: (tag: string) => void;
	/** A checklist box was tapped: the 0-based line of the item in the note body. */
	onToggleTask: (line: number) => void;
};

export default function PostCard({
	note,
	showLikes,
	avatar,
	nickname,
	onMenu,
	onTag,
	onToggleTask,
}: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const edited = note.modifiedAt - note.createdAt > 60_000;
	// The ref lives on a plain View (not on the Pressable) so its type is
	// exactly View, and collapsable={false} stops Android from flattening it
	// away, which would make measureInWindow return nothing.
	const menuRef = useRef<ComponentRef<typeof View>>(null);
	const openMenu = () =>
		menuRef.current?.measureInWindow((x, y, width, height) =>
			onMenu({ x, y, width, height }),
		);

	return (
		<View style={s.card}>
			<View style={s.header}>
				<Avatar avatar={avatar} />
				<View style={{ flex: 1 }}>
					{nickname && (
						<Text style={s.handle} numberOfLines={1}>
							{nickname}
						</Text>
					)}
					<Text style={s.meta}>
						{timeAgo(note.createdAt)}
						{edited ? " · edited" : ""}
					</Text>
				</View>
				<View ref={menuRef} collapsable={false}>
					<Pressable onPress={openMenu} hitSlop={12}>
						<Ionicons
							name="ellipsis-horizontal"
							size={20}
							color={theme.text}
						/>
					</Pressable>
				</View>
			</View>

			{note.title && <Text style={s.title}>{note.title}</Text>}
			<MarkdownText text={note.body} onToggleTask={onToggleTask} />

			{note.tags.length > 0 && (
				<View style={s.tagRow}>
					{note.tags.map((tag) => (
						<Pressable
							key={tag}
							onPress={() => onTag(tag)}
							hitSlop={6}
						>
							<Text style={s.tag}>#{tag}</Text>
						</Pressable>
					))}
				</View>
			)}

			{showLikes && (
				<View style={s.footer}>
					<View style={s.likesRow}>
						<Ionicons name="heart" size={16} color={theme.accent} />
						<Text style={s.likes}>{note.likes}</Text>
					</View>
				</View>
			)}
		</View>
	);
}

const makeStyles = (t: Theme) =>
	StyleSheet.create({
		card: {
			backgroundColor: t.card,
			borderRadius: 8,
			padding: 14,
			marginBottom: 14,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			marginBottom: 10,
			gap: 10,
		},
		handle: { color: t.text, fontWeight: "700", fontSize: 15 },
		meta: { color: t.text + "99", fontSize: 12 },
		title: {
			color: t.text,
			fontSize: 22,
			lineHeight: 30,
			fontWeight: "800",
			marginBottom: 6,
		},
		tagRow: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 10,
			marginTop: 10,
		},
		tag: { color: t.text + "99", fontSize: 14 },
		footer: {
			flexDirection: "row",
			justifyContent: "flex-end",
			marginTop: 12,
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: t.text + "33",
			paddingTop: 10,
		},
		likesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
		likes: { color: t.accent, fontWeight: "700", fontSize: 14 },
	});
