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
import { Ionicons } from "@expo/vector-icons";
import {
	AVATAR_ICONS,
	LIMITS,
	PRESET_LABELS,
	PRESETS,
	ROLE_LABELS,
	SWATCHES,
} from "../constants";
import { LANGUAGES, SYSTEM_LANGUAGE } from "../i18n";
import { useI18n } from "../i18n/I18nContext";
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
	onPickVault: () => void;
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
	onPickVault,
	onPickPhoto,
	onRemovePhoto,
	onResetAll,
	onClose,
}: Props) {
	const theme = useTheme();
	const { t, language } = useI18n();
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
					<Text style={s.title}>{t("settings.title")}</Text>
					<Pressable onPress={onClose} style={s.doneBtn}>
						<Text style={s.doneText}>{t("common.done")}</Text>
					</Pressable>
				</View>

				<ScrollView
					contentContainerStyle={{ padding: 16 }}
					automaticallyAdjustKeyboardInsets
					keyboardShouldPersistTaps="handled"
				>
					{/* language: new languages appear here by themselves (see src/i18n) */}
					<Text style={s.section}>{t("settings.language")}</Text>
					<View style={s.langCard}>
						{[
							{
								code: SYSTEM_LANGUAGE,
								title: t("settings.languageSystem"),
								// what "system" resolves to right now
								detail: LANGUAGES.find(
									(l) => l.code === language,
								)?.name,
							},
							...LANGUAGES.map((l) => ({
								code: l.code,
								title: l.name,
								detail: undefined,
							})),
						].map((option, i) => {
							// An unknown saved code (a removed language) counts as "system".
							const selected =
								option.code === settings.language ||
								(option.code === SYSTEM_LANGUAGE &&
									!LANGUAGES.some(
										(l) => l.code === settings.language,
									));
							return (
								<Pressable
									key={option.code}
									accessibilityRole="radio"
									accessibilityState={{ selected }}
									onPress={() =>
										update("language", option.code)
									}
									style={({ pressed }) => [
										s.langRow,
										i > 0 && s.langRowBorder,
										pressed && s.langPressed,
									]}
								>
									<View style={{ flex: 1 }}>
										<Text style={s.rowTitle}>
											{option.title}
										</Text>
										{option.detail && (
											<Text style={s.rowHint}>
												{option.detail}
											</Text>
										)}
									</View>
									{selected && (
										<Ionicons
											name="checkmark"
											size={22}
											color={theme.accent}
										/>
									)}
								</Pressable>
							);
						})}
					</View>
					<Text style={[s.rowHint, s.langHint]}>
						{t("settings.languageHint")}
					</Text>

					{/* folder */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.folder")}
					</Text>
					<View style={s.rowBlock}>
						<Text style={s.rowTitle}>
							{folderLabel(settings.folderUri, t)}
						</Text>
						<Text style={s.rowHint}>
							{t("settings.folderHint")}
						</Text>
						<View style={s.btnRow}>
							<Pressable style={s.btn} onPress={onPickFolder}>
								<Text style={s.btnText}>
									{t("settings.chooseFolder")}
								</Text>
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
										{t("settings.useAppStorage")}
									</Text>
								</Pressable>
							)}
						</View>
					</View>

					<View style={[s.row, { marginTop: 12 }]}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>
								{t("settings.obsidian")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.obsidianHint")}
							</Text>
						</View>
						<Switch
							value={settings.obsidianEnabled}
							onValueChange={(v) => update("obsidianEnabled", v)}
							trackColor={{
								true: theme.accent,
								false: "#88888888",
							}}
						/>
					</View>
					{settings.obsidianEnabled && (
						<View style={[s.rowBlock, { marginTop: 12 }]}>
							<Text style={s.rowTitle}>
								{settings.vaultUri
									? folderLabel(settings.vaultUri, t)
									: t("settings.noVault")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.vaultHint")}
							</Text>
							<View style={s.btnRow}>
								<Pressable style={s.btn} onPress={onPickVault}>
									<Text style={s.btnText}>
										{t("settings.chooseFolder")}
									</Text>
								</Pressable>
								{settings.vaultUri && (
									<Pressable
										style={[s.btn, s.btnGhost]}
										onPress={() => update("vaultUri", null)}
									>
										<Text
											style={[
												s.btnText,
												{ color: theme.accent },
											]}
										>
											{t("settings.clear")}
										</Text>
									</Pressable>
								)}
							</View>
						</View>
					)}

					{/* User */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.user")}
					</Text>
					<View style={s.row}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>
								{t("settings.showNickname")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.showNicknameHint")}
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
							placeholder={t("settings.nicknamePlaceholder")}
							placeholderTextColor={theme.text + "77"}
							maxLength={30}
							autoCorrect={false}
							returnKeyType="done"
						/>
					)}
					<View style={[s.row, { marginTop: 12 }]}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>
								{t("settings.showAvatar")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.showAvatarHint")}
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
											? t("settings.changePhoto")
											: t("settings.choosePhoto")}
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
											{t("settings.removePhoto")}
										</Text>
									</Pressable>
								)}
							</View>
						</>
					)}

					{/* UI */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.ui")}
					</Text>
					<View style={[s.row, { marginTop: 12 }]}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>
								{t("settings.likes")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.likesHint")}
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
							title={t("settings.maxChars")}
							hint={t("settings.maxCharsHint", {
								min: LIMITS.chars.min,
								max: LIMITS.chars.max,
							})}
							value={settings.maxChars}
							min={LIMITS.chars.min}
							max={LIMITS.chars.max}
							onChange={(n) => update("maxChars", n)}
						/>
					</View>
					<View style={{ marginTop: 12 }}>
						<NumberField
							title={t("settings.maxTags")}
							hint={t("settings.maxTagsHint", {
								min: LIMITS.tags.min,
								max: LIMITS.tags.max,
							})}
							value={settings.maxTags}
							min={LIMITS.tags.min}
							max={LIMITS.tags.max}
							onChange={(n) => update("maxTags", n)}
						/>
					</View>

					{/* theme */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.theme")}
					</Text>
					<Text style={[s.sectionTitle]}>
						{t("settings.presets")}
					</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8 }}
					>
						{Object.entries(PRESETS).map(([name, p]) => (
							<Pressable
								key={
									PRESET_LABELS[name]
										? t(PRESET_LABELS[name])
										: name
								}
								onPress={() => update("theme", p)}
								style={[
									s.preset,
									{
										backgroundColor: p.background,
										borderColor: p.accent,
									},
								]}
							>
								<View
									style={[
										s.presetCard,
										{ backgroundColor: p.card },
									]}
								>
									<View
										style={{
											height: 6,
											width: 26,
											borderRadius: 3,
											backgroundColor: p.text,
											marginBottom: 4,
										}}
									/>
									<View
										style={{
											height: 6,
											width: 16,
											borderRadius: 3,
											backgroundColor: p.accent,
										}}
									/>
								</View>
								<Text
									style={{
										color: readableOn(p.background),
										fontSize: 12,
										marginTop: 4,
									}}
								>
									{PRESET_LABELS[name]
										? t(PRESET_LABELS[name])
										: name}
								</Text>
							</Pressable>
						))}
					</ScrollView>

					{roles.map((role) => (
						<View key={role} style={{ marginTop: 8 }}>
							<Text style={s.sectionTitle}>
								{t(ROLE_LABELS[role])}
							</Text>
							<View style={s.swatchRow}>
								{SWATCHES[role].map((c) => (
									<Pressable
										key={c}
										accessibilityRole="button"
										accessibilityState={{
											selected:
												settings.theme[role] === c,
										}}
										onPress={() =>
											update("theme", {
												...settings.theme,
												[role]: c,
											})
										}
										style={[
											s.swatchRing,
											settings.theme[role] === c &&
												s.swatchRingActive,
										]}
									>
										<View
											style={[
												s.swatch,
												{ backgroundColor: c },
											]}
										/>
									</Pressable>
								))}
							</View>
						</View>
					))}

					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.reset")}
					</Text>
					<View style={s.resetCard}>
						<Text style={s.resetText}>
							{t("settings.resetHint")}
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
							{t("settings.resetButton")}
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
		langCard: {
			backgroundColor: t.card,
			borderRadius: 8,
			overflow: "hidden",
		},
		langRow: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 14,
			paddingVertical: 12,
		},
		langRowBorder: {
			borderTopWidth: StyleSheet.hairlineWidth,
			borderTopColor: t.text + "33",
		},
		langPressed: { backgroundColor: t.text + "14" },
		langHint: { color: onBg, opacity: 0.7, marginTop: 8 },
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
		// The selected swatch gets two rings: a gap in the background color,
		// then the accent color around it, so it shows even when the swatch IS the accent.
		swatchRing: {
			width: 46,
			height: 46,
			borderRadius: 23,
			borderWidth: 2,
			borderColor: "transparent",
			padding: 3,
			backgroundColor: t.background,
		},
		swatchRingActive: { borderColor: t.accent },
		swatch: {
			flex: 1,
			borderRadius: 20,
			borderWidth: 1,
			borderColor: "#88888855",
		},
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
			padding: 3,
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
