import { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Chip from "../components/Chip";
import Composer from "../components/Composer";
import PostCard from "../components/PostCard";
import PostMenu from "../components/PostMenu";
import SettingsModal from "../components/SettingsModal";
import { useNotes } from "../hooks/useNotes";
import { useT } from "../i18n/I18nContext";
import { pickDirectory } from "../storage/notesFolder";
import { deleteAvatarImage, pickAvatarImage } from "../storage/avatarImage";
import { useTheme } from "../theme/ThemeContext";
import { Anchor, Draft, Note, Settings, Theme, UpdateSetting } from "../types";
import { readableOn } from "../utils/format";

type Props = {
	settings: Settings;
	updateSetting: UpdateSetting;
	resetSettings: () => Promise<void>;
	/** Looks for the vault's pictures again (pull to refresh). */
	refreshVault: () => void;
	/** Called once, when the notes have been read for the first time. */
	onFirstLoad: () => void;
};

export default function FeedScreen({
	settings,
	updateSetting,
	resetSettings,
	refreshVault,
	onFirstLoad,
}: Props) {
	const theme = useTheme();
	const t = useT();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const insets = useSafeAreaInsets(); // known from the first frame (see App)
	const { width } = useWindowDimensions();
	const columns = width >= 900 ? 3 : width >= 600 ? 2 : 1; // re-evaluates on rotation
	// What the avatar renders: null (hidden), an icon name, or a photo URI.
	const avatarValue = !settings.avatarEnabled
		? null
		: settings.avatar === "photo"
			? (settings.avatarImage ?? "person")
			: settings.avatar;
	// null hides the name; an empty nickname falls back to "you".
	const nicknameValue = settings.nicknameEnabled
		? settings.nickname.trim() || t("feed.you")
		: null;
	const {
		notes,
		loading,
		usingFallback,
		refresh,
		addNote,
		editNote,
		toggleTask,
		removeNote,
		wipeAll,
		registerViews,
	} = useNotes(settings.folderUri, settings.likesEnabled);

	const [query, setQuery] = useState("");
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [composer, setComposer] = useState<{
		open: boolean;
		editing: Note | null;
	}>({ open: false, editing: null });
	const [settingsOpen, setSettingsOpen] = useState(false);
	// The settings window is only built the first time it is opened.
	const [settingsBuilt, setSettingsBuilt] = useState(false);
	if (settingsOpen && !settingsBuilt) setSettingsBuilt(true);

	useEffect(() => {
		if (!loading) onFirstLoad();
	}, [loading, onFirstLoad]);

	const [menu, setMenu] = useState<{ note: Note; anchor: Anchor } | null>(
		null,
	);

	// FlatList needs a stable viewability callback, so route through a ref.
	const registerRef = useRef(registerViews);
	registerRef.current = registerViews;
	const onViewable = useRef(
		({ viewableItems }: { viewableItems: { item: Note }[] }) =>
			registerRef.current(viewableItems.map((v) => v.item.id)),
	).current;
	const viewConfig = useRef({
		itemVisiblePercentThreshold: 60,
		minimumViewTime: 600,
	}).current;

	const allTags = useMemo(() => {
		const counts: Record<string, number> = {};
		notes.forEach((n) =>
			n.tags.forEach((t) => {
				counts[t] = (counts[t] || 0) + 1;
			}),
		);
		return Object.entries(counts)
			.sort((a, b) => b[1] - a[1])
			.map(([t]) => t);
	}, [notes]);

	const visible = useMemo(() => {
		const q = query.trim().toLowerCase();
		return notes
			.filter((n) => !activeTag || n.tags.includes(activeTag))
			.filter(
				(n) =>
					!q ||
					n.body.toLowerCase().includes(q) ||
					(n.title ?? "").toLowerCase().includes(q) ||
					n.tags.some((t) => t.includes(q.replace(/^#/, ""))),
			)
			.sort((a, b) => b.createdAt - a.createdAt);
	}, [notes, query, activeTag]);

	const closeComposer = () => setComposer({ open: false, editing: null });

	const handleSave = (draft: Draft) => {
		const ok = composer.editing
			? editNote(composer.editing, draft)
			: addNote(draft);
		if (ok) closeComposer();
	};

	const confirmDelete = (n: Note) =>
		Alert.alert(t("feed.deleteTitle"), t("feed.deleteBody"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.delete"),
				style: "destructive",
				onPress: () => removeNote(n),
			},
		]);

	// The short delay lets the menu finish closing first. On iOS, presenting a new
	// modal or alert while another one is dismissing can silently fail.
	const menuEdit = () => {
		const n = menu?.note;
		setMenu(null);
		if (n) setTimeout(() => setComposer({ open: true, editing: n }), 100);
	};
	const menuDelete = () => {
		const n = menu?.note;
		setMenu(null);
		if (n) setTimeout(() => confirmDelete(n), 100);
	};

	const handlePickFolder = async () => {
		const uri = await pickDirectory();
		if (uri) updateSetting("folderUri", uri);
	};

	const handlePickVault = async () => {
		const uri = await pickDirectory();
		if (uri) updateSetting("vaultUri", uri);
	};

	const handlePickPhoto = async () => {
		const uri = await pickAvatarImage();
		if (!uri) return;
		deleteAvatarImage(settings.avatarImage); // drop the previous photo
		updateSetting("avatarImage", uri);
		updateSetting("avatar", "photo");
	};

	const handleRemovePhoto = () => {
		deleteAvatarImage(settings.avatarImage);
		updateSetting("avatarImage", null);
		if (settings.avatar === "photo") updateSetting("avatar", "person");
	};

	const handleResetAll = () => {
		Alert.alert(t("feed.resetTitle"), t("feed.resetBody"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.continue"),
				style: "destructive",
				// Wait for this alert to close: iOS drops an alert shown while another is dismissing.
				onPress: () => setTimeout(confirmResetAll, 300),
			},
		]);
	};

	const confirmResetAll = () =>
		Alert.alert(t("feed.resetSureTitle"), t("feed.resetSureBody"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("feed.resetSureConfirm"),
				style: "destructive",
				onPress: resetAll,
			},
		]);

	const resetAll = async () => {
		try {
			wipeAll(); // deletes every .md note in the folder in use (and in app storage)
			deleteAvatarImage(settings.avatarImage);
			await resetSettings(); // empties the db and restores the default settings
			setQuery("");
			setActiveTag(null);
			setSettingsOpen(false);
		} catch (e) {
			Alert.alert(
				t("feed.resetFailed"),
				String(e instanceof Error ? e.message : e),
			);
		}
	};

	return (
		<View
			style={[
				s.root,
				{
					paddingTop: insets.top,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				},
			]}
		>
			{usingFallback && (
				<Pressable
					style={s.banner}
					onPress={() => setSettingsOpen(true)}
				>
					<Text style={s.bannerText}>{t("feed.fallbackBanner")}</Text>
				</Pressable>
			)}

			<View style={s.searchRow}>
				<TextInput
					style={s.search}
					placeholder={t("feed.search")}
					placeholderTextColor={theme.text + "88"}
					value={query}
					onChangeText={setQuery}
					returnKeyType="search"
					clearButtonMode="while-editing"
				/>
				<Pressable onPress={() => setSettingsOpen(true)} hitSlop={10}>
					<Ionicons
						name="settings-outline"
						size={24}
						color={readableOn(theme.background)}
					/>
				</Pressable>
			</View>

			{allTags.length > 0 && (
				<View>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={s.chipRow}
					>
						<Chip
							label={t("feed.all")}
							active={!activeTag}
							onPress={() => setActiveTag(null)}
						/>
						{allTags.map((t) => (
							<Chip
								key={t}
								label={`#${t}`}
								active={activeTag === t}
								onPress={() =>
									setActiveTag(activeTag === t ? null : t)
								}
							/>
						))}
					</ScrollView>
				</View>
			)}

			<FlatList
				key={columns} // FlatList can't change numColumns on the fly
				numColumns={columns}
				columnWrapperStyle={
					columns > 1
						? { gap: 12, alignItems: "flex-start" }
						: undefined
				}
				data={visible}
				keyExtractor={(n) => n.id}
				contentContainerStyle={{ padding: 12, paddingBottom: 85 }}
				onViewableItemsChanged={onViewable}
				viewabilityConfig={viewConfig}
				refreshControl={
					<RefreshControl
						refreshing={false}
						onRefresh={() => {
							refresh();
							refreshVault();
						}}
						tintColor={theme.accent}
					/>
				}
				ListEmptyComponent={
					<Text style={s.empty}>
						{loading
							? t("feed.loading")
							: notes.length === 0
								? t("feed.empty")
								: t("feed.noMatch")}
					</Text>
				}
				renderItem={({ item }) => {
					const card = (
						<PostCard
							note={item}
							showLikes={settings.likesEnabled}
							avatar={avatarValue}
							nickname={nicknameValue}
							onMenu={(anchor) => setMenu({ note: item, anchor })}
							onTag={setActiveTag}
							onToggleTask={(line) => toggleTask(item, line)}
						/>
					);
					return columns > 1 ? (
						<View style={{ flex: 1 }}>{card}</View>
					) : (
						card
					);
				}}
			/>

			<Pressable
				style={s.fab}
				onPress={() => setComposer({ open: true, editing: null })}
			>
				<Ionicons
					name="add"
					size={32}
					color={readableOn(theme.accent)}
				/>
			</Pressable>

			<PostMenu
				visible={menu !== null}
				anchor={menu?.anchor ?? null}
				onClose={() => setMenu(null)}
				onEdit={menuEdit}
				onDelete={menuDelete}
			/>

			<Composer
				key={composer.editing?.id ?? (composer.open ? "new" : "closed")}
				visible={composer.open}
				editing={composer.editing}
				avatar={avatarValue}
				nickname={nicknameValue}
				maxChars={settings.maxChars}
				maxTags={settings.maxTags}
				onClose={closeComposer}
				onSave={handleSave}
			/>

			{settingsBuilt && (
				<SettingsModal
					visible={settingsOpen}
					settings={settings}
					update={updateSetting}
					onPickFolder={handlePickFolder}
					onPickVault={handlePickVault}
					onPickPhoto={handlePickPhoto}
					onRemovePhoto={handleRemovePhoto}
					onResetAll={handleResetAll}
					onClose={() => setSettingsOpen(false)}
				/>
			)}
		</View>
	);
}

const makeStyles = (t: Theme) => {
	const onBg = readableOn(t.background);
	return StyleSheet.create({
		root: { flex: 1, backgroundColor: t.background },
		banner: {
			backgroundColor: "#FF4D4D",
			marginHorizontal: 12,
			marginTop: 8,
			marginBottom: 4,
			padding: 10,
			borderRadius: 8,
		},
		bannerText: { color: "#fff", fontSize: 13 },
		searchRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			paddingHorizontal: 12,
			paddingTop: 16,
			paddingBottom: 8,
		},
		search: {
			flex: 1,
			backgroundColor: t.card,
			color: t.text,
			borderRadius: 8,
			paddingHorizontal: 14,
			paddingVertical: 10,
			fontSize: 15,
		},
		chipRow: { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
		empty: {
			color: onBg,
			opacity: 0.7,
			textAlign: "center",
			marginTop: 80,
			fontSize: 16,
			lineHeight: 24,
		},
		fab: {
			position: "absolute",
			right: 20,
			bottom: 20,
			width: 60,
			height: 60,
			borderRadius: 30,
			backgroundColor: t.accent,
			alignItems: "center",
			justifyContent: "center",
			elevation: 6,
			shadowColor: "#000",
			shadowOpacity: 0.3,
			shadowRadius: 6,
			shadowOffset: { width: 0, height: 3 },
		},
	});
};
