import { useMemo } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	AVATAR_ICONS,
	LIMITS,
	PRESETS,
	ROLE_LABELS,
	SWATCHES,
} from "../constants";
import { useTheme } from "../theme/ThemeContext";
import { Settings, Theme, UpdateSetting } from "../types";
import { folderLabel, readableOn } from "../utils/format";
import Avatar from "./Avatar";
import CreditsSection from "./CreditsSection";
import NumberField from "./NumberField";

type Props = {
	visible: boolean;
	settings: Settings;
	update: UpdateSetting;
	onPickFolder: () => void;
	onPickPhoto: () => void;
	onRemovePhoto: () => void;
	onResetAll: () => void;
	onClose: () => void;
};

export default function SettingsModal({
	visible,
	settings,
	update,
	onPickFolder,
	onPickPhoto,
	onRemovePhoto,
	onResetAll,
	onClose,
}: Props) {
	const theme = useTheme();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const roles = Object.keys(SWATCHES) as (keyof Theme)[];

	return (
		<Modal
			visible={visible}
			animationType="slide"
			onRequestClose={onClose}
			supportedOrientations={["portrait", "landscape"]}
		>
			<SafeAreaView style={s.root}>
				<View style={s.header}>
					<Text style={s.title}>Settings</Text>
					<Pressable onPress={onClose} style={s.doneBtn}>
						<Text style={s.doneText}>Done</Text>
					</Pressable>
				</View>

				<ScrollView
					contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
					automaticallyAdjustKeyboardInsets
					keyboardShouldPersistTaps="handled"
				>
					{/* folder */}
					<Text style={s.section}>Folder</Text>
					<View style={s.rowBlock}>
						<Text style={s.rowTitle}>
							{folderLabel(settings.folderUri)}
						</Text>
						<Text style={s.rowHint}>
							Each post is saved as a .md file named after its
							title, with its tags at the top. Changing folders
							doesn't move existing notes.
						</Text>
						<View style={s.btnRow}>
							<Pressable style={s.btn} onPress={onPickFolder}>
								<Text style={s.btnText}>Choose folder</Text>
							</Pressable>
							{settings.folderUri && (
								<Pressable
									style={[s.btn, s.btnGhost]}
									onPress={() => update("folderUri", null)}
								>
									<Text
										style={[
											s.btnText,
											{ color: theme.accent },
										]}
									>
										Use app storage
									</Text>
								</Pressable>
							)}
						</View>
					</View>

					{/* User */}
					<Text style={[s.section, { marginTop: 24 }]}>User</Text>
					<View style={s.row}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>Show nickname</Text>
							<Text style={s.rowHint}>
								Hides the name on posts and in the editor.
							</Text>
						</View>
						<Switch
							value={settings.nicknameEnabled}
							onValueChange={(v) => update("nicknameEnabled", v)}
							trackColor={{
								true: theme.accent,
								false: "#88888888",
							}}
						/>
					</View>
					{settings.nicknameEnabled && (
						<TextInput
							style={s.nicknameInput}
							value={settings.nickname}
							onChangeText={(v) => update("nickname", v)}
							placeholder="Nickname"
							placeholderTextColor={theme.text + "77"}
							maxLength={30}
							autoCorrect={false}
							returnKeyType="done"
						/>
					)}
					<View style={[s.row, { marginTop: 12 }]}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>Show avatar</Text>
							<Text style={s.rowHint}>
								Hides the avatar on posts and in the editor.
							</Text>
						</View>
						<Switch
							value={settings.avatarEnabled}
							onValueChange={(v) => update("avatarEnabled", v)}
							trackColor={{
								true: theme.accent,
								false: "#88888888",
							}}
						/>
					</View>
					{settings.avatarEnabled && (
						<>
							<View style={s.avatarGrid}>
								{settings.avatarImage && (
									<Pressable
										onPress={() =>
											update("avatar", "photo")
										}
										style={[
											s.avatarOption,
											settings.avatar === "photo" &&
												s.avatarOptionActive,
										]}
									>
										<Avatar
											avatar={settings.avatarImage}
											size={44}
										/>
									</Pressable>
								)}
								{AVATAR_ICONS.map((a) => (
									<Pressable
										key={a}
										onPress={() => update("avatar", a)}
										style={[
											s.avatarOption,
											settings.avatar === a &&
												s.avatarOptionActive,
										]}
									>
										<Avatar avatar={a} size={44} />
									</Pressable>
								))}
							</View>
							<View style={s.btnRow}>
								<Pressable style={s.btn} onPress={onPickPhoto}>
									<Text style={s.btnText}>
										{settings.avatarImage
											? "Change photo"
											: "Choose photo"}
									</Text>
								</Pressable>
								{settings.avatarImage && (
									<Pressable
										style={[s.btn, s.btnGhost]}
										onPress={onRemovePhoto}
									>
										<Text
											style={[
												s.btnText,
												{ color: theme.accent },
											]}
										>
											Remove photo
										</Text>
									</Pressable>
								)}
							</View>
						</>
					)}

					{/* UI */}
					<Text style={[s.section, { marginTop: 24 }]}>UI</Text>
					<View style={[s.row, { marginTop: 12 }]}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>Fake likes</Text>
							<Text style={s.rowHint}>
								Off hides the counter and stops new likes.
								Existing counts are kept.
							</Text>
						</View>
						<Switch
							value={settings.likesEnabled}
							onValueChange={(v) => update("likesEnabled", v)}
							trackColor={{
								true: theme.accent,
								false: "#88888888",
							}}
						/>
					</View>
					<View style={{ marginTop: 12 }}>
						<NumberField
							title="Characters per post"
							hint={`From ${LIMITS.chars.min} to ${LIMITS.chars.max}. Posts you already wrote are never cut.`}
							value={settings.maxChars}
							min={LIMITS.chars.min}
							max={LIMITS.chars.max}
							onChange={(n) => update("maxChars", n)}
						/>
					</View>
					<View style={{ marginTop: 12 }}>
						<NumberField
							title="Tags per post"
							hint={`From ${LIMITS.tags.min} to ${LIMITS.tags.max}. 0 hides the tag box when writing.`}
							value={settings.maxTags}
							min={LIMITS.tags.min}
							max={LIMITS.tags.max}
							onChange={(n) => update("maxTags", n)}
						/>
					</View>

					{/* theme */}
					<Text style={[s.section, { marginTop: 24 }]}>Theme</Text>
					<Text style={[s.sectionTitle]}>Presets</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8 }}
					>
						{Object.entries(PRESETS).map(([name, t]) => (
							<Pressable
								key={name}
								onPress={() => update("theme", t)}
								style={[
									s.preset,
									{
										backgroundColor: t.background,
										borderColor: t.accent,
									},
								]}
							>
								<View
									style={[
										s.presetCard,
										{ backgroundColor: t.card },
									]}
								>
									<View
										style={{
											height: 6,
											width: 26,
											borderRadius: 3,
											backgroundColor: t.text,
											marginBottom: 4,
										}}
									/>
									<View
										style={{
											height: 6,
											width: 16,
											borderRadius: 3,
											backgroundColor: t.accent,
										}}
									/>
								</View>
								<Text
									style={{
										color: readableOn(t.background),
										fontSize: 12,
										marginTop: 4,
									}}
								>
									{name}
								</Text>
							</Pressable>
						))}
					</ScrollView>

					{roles.map((role) => (
						<View key={role} style={{ marginTop: 8 }}>
							<Text style={s.sectionTitle}>
								{ROLE_LABELS[role]}
							</Text>
							<View style={s.swatchRow}>
								{SWATCHES[role].map((c) => (
									<Pressable
										key={c}
										onPress={() =>
											update("theme", {
												...settings.theme,
												[role]: c,
											})
										}
										style={[
											s.swatch,
											{ backgroundColor: c },
											settings.theme[role] === c &&
												s.swatchActive,
										]}
									/>
								))}
							</View>
						</View>
					))}

					<Text style={[s.section, { marginTop: 24 }]}>Reset</Text>
					<View style={s.resetCard}>
						<Text style={s.resetText}>
							Deletes every note in your notes folder, plus all
							likes and settings, and puts the app back the way it
							was on first launch. This can't be undone.
						</Text>
					</View>
					<Pressable
						accessibilityRole="button"
						onPress={onResetAll}
						style={({ pressed }) => [
							s.resetBtn,
							pressed && s.resetPressed,
						]}
					>
						<Text style={s.resetBtnText}>
							Delete all notes and reset app
						</Text>
					</Pressable>
					<CreditsSection />
				</ScrollView>
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
			justifyContent: "space-between",
			padding: 14,
		},
		title: { color: onBg, fontSize: 20, fontWeight: "800" },
		doneBtn: {
			backgroundColor: t.accent,
			paddingHorizontal: 20,
			paddingVertical: 8,
			borderRadius: 18,
		},
		doneText: {
			color: readableOn(t.accent),
			fontWeight: "800",
			fontSize: 15,
		},
		section: {
			color: onBg,
			fontWeight: "700",
			marginBottom: 8,
			fontSize: 14,
			opacity: 0.85,
		},
		sectionTitle: {
			color: onBg,
			fontWeight: "700",
			marginBottom: 8,
			fontSize: 12,
			opacity: 0.85,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: t.card,
			borderRadius: 8,
			padding: 14,
		},
		rowBlock: { backgroundColor: t.card, borderRadius: 8, padding: 14 },
		rowTitle: { color: t.text, fontWeight: "700", fontSize: 15 },
		rowHint: {
			color: t.text + "99",
			fontSize: 13,
			marginTop: 4,
			lineHeight: 18,
		},
		btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
		btn: {
			backgroundColor: t.accent,
			paddingHorizontal: 16,
			paddingVertical: 9,
			borderRadius: 18,
			borderWidth: 1,
			borderColor: t.accent,
		},
		btnGhost: { backgroundColor: "transparent" },
		btnText: {
			color: readableOn(t.accent),
			fontWeight: "700",
			fontSize: 14,
		},
		preset: {
			width: 84,
			padding: 8,
			borderRadius: 8,
			borderWidth: 2,
			alignItems: "center",
		},
		presetCard: { width: "100%", borderRadius: 4, padding: 6 },
		swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
		swatch: {
			width: 40,
			height: 40,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: "#88888855",
		},
		swatchActive: { borderWidth: 3, borderColor: t.accent },
		resetWrap: { marginTop: 32 },
		resetCard: { backgroundColor: t.card, borderRadius: 8, padding: 14 },
		resetText: { color: t.text, fontSize: 13, lineHeight: 18 },
		resetBtn: {
			alignSelf: "stretch",
			alignItems: "center",
			marginTop: 12,
			paddingVertical: 12,
			borderRadius: 10,
			borderWidth: 1,
			borderColor: "#FF4D4D",
		},
		resetBtnText: { color: "#FF4D4D", fontWeight: "700", fontSize: 14 },
		resetPressed: { opacity: 0.6 },
		avatarGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 10,
			marginTop: 12,
		},
		avatarOption: {
			padding: 4,
			borderRadius: 10,
			borderWidth: 2,
			borderColor: "transparent",
		},
		avatarOptionActive: { borderColor: t.accent },
		nicknameInput: {
			backgroundColor: t.card,
			color: t.text,
			borderRadius: 8,
			paddingHorizontal: 14,
			paddingVertical: 10,
			fontSize: 15,
			marginTop: 12,
		},
	});
};
