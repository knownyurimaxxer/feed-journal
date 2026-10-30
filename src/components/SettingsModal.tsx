import { Fragment, ReactNode, useMemo, useState } from "react";
import {
	Linking,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	AVATAR_ICONS,
	HAPTIC_TRIGGERS,
	LIMITS,
	LINKS,
	PRESET_LABELS,
	PRESETS,
	ROLE_LABELS,
	SWATCHES,
} from "../constants";
import {
	LANGUAGES,
	makeTranslator,
	SYSTEM_LANGUAGE,
	type MessageKey,
} from "../i18n";
import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../theme/ThemeContext";
import { Settings, Theme, UpdateSetting } from "../types";
import { folderLabel, readableOn } from "../utils/format";
import { haptic, playHaptic } from "../utils/haptics";
import Avatar from "./Avatar";
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

const open = (url: string) => {
	Linking.openURL(url).catch((e) =>
		console.warn("Could not open link", url, e),
	);
};

/**
 * Fills a translated sentence such as "Made by {developer}." with the links
 * that belong in its {placeholders}, wherever the language puts them.
 */
function fill(template: string, parts: Record<string, ReactNode>): ReactNode[] {
	return template.split(/(\{\w+\})/).map((chunk, i) => {
		const name = chunk.match(/^\{(\w+)\}$/)?.[1];
		return name && name in parts ? (
			<Fragment key={i}>{parts[name]}</Fragment>
		) : (
			chunk
		);
	});
}

const HAPTIC_LABEL: Record<(typeof HAPTIC_TRIGGERS)[number], MessageKey> = {
	done: "haptics.done",
	save: "haptics.save",
	cancel: "haptics.cancel",
	menu: "haptics.menu",
	action: "haptics.action",
	settings: "haptics.settings",
	refresh: "haptics.refresh",
	compose: "haptics.compose",
	checklist: "haptics.checklist",
	tag: "haptics.tag",
	delete: "haptics.delete",
	error: "haptics.error",
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
	const insets = useSafeAreaInsets(); // known from the first frame (see App)
	const { t, systemLanguage } = useI18n();
	const s = useMemo(() => makeStyles(theme), [theme]);
	const roles = Object.keys(SWATCHES) as (keyof Theme)[];
	const [languagesOpen, setLanguagesOpen] = useState(false);
	const [hapticsOpen, setHapticsOpen] = useState(false);

	// "System default" is written in the phone's language (the one it would
	// switch to), like every other option is written in its own language.
	const systemLang =
		LANGUAGES.find((l) => l.code === systemLanguage) ?? LANGUAGES[0];
	const languageOptions = [
		{
			code: SYSTEM_LANGUAGE,
			title: makeTranslator(systemLang.messages)(
				"settings.languageSystem",
			),
			detail: systemLang.name,
		},
		...LANGUAGES.map((l) => ({
			code: l.code,
			title: l.name,
			detail: undefined,
		})),
	];
	// An unknown saved code (a removed language) counts as "system".
	const chosenLanguage = LANGUAGES.some((l) => l.code === settings.language)
		? settings.language
		: SYSTEM_LANGUAGE;
	const currentLanguage =
		languageOptions.find((o) => o.code === chosenLanguage) ??
		languageOptions[0];

	const link = (label: string, url: string) => (
		<Text style={s.link} accessibilityRole="link" onPress={() => open(url)}>
			{label}
		</Text>
	);
	const languageLabel = (option: (typeof languageOptions)[number]) => (
		<View style={{ flex: 1 }}>
			<Text style={s.rowTitle}>{option.title}</Text>
			{option.detail && <Text style={s.rowHint}>{option.detail}</Text>}
		</View>
	);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			onRequestClose={onClose}
			// Draw under both system bars, so the insets below are exactly right.
			statusBarTranslucent
			navigationBarTranslucent
			supportedOrientations={["portrait", "landscape"]}
		>
			<View
				style={[
					s.root,
					{
						paddingTop: insets.top,
						paddingBottom: insets.bottom,
						paddingLeft: insets.left,
						paddingRight: insets.right,
					},
				]}
			>
				<View style={s.header}>
					<Text style={s.title}>{t("settings.title")}</Text>
					<Pressable
						onPress={() => {
							haptic("done");
							onClose();
						}}
						style={s.doneBtn}
					>
						<Text style={s.doneText}>{t("common.done")}</Text>
					</Pressable>
				</View>

				<ScrollView
					contentContainerStyle={{ padding: 16 }}
					automaticallyAdjustKeyboardInsets
					keyboardShouldPersistTaps="handled"
				>
					{/* language: new languages appear here by themselves (see src/i18n).
					    Closed it is one row, so a long list never takes over the page. */}
					<Text style={s.section}>{t("settings.language")}</Text>
					<View style={s.langCard}>
						<Pressable
							accessibilityRole="button"
							accessibilityState={{ expanded: languagesOpen }}
							onPress={() => setLanguagesOpen((o) => !o)}
							style={({ pressed }) => [
								s.langRow,
								pressed && s.langPressed,
							]}
						>
							{languageLabel(currentLanguage)}
							<Ionicons
								name={
									languagesOpen
										? "chevron-up"
										: "chevron-down"
								}
								size={22}
								color={theme.text}
							/>
						</Pressable>
						{languagesOpen && (
							<ScrollView
								nestedScrollEnabled
								style={s.langList}
								keyboardShouldPersistTaps="handled"
							>
								{languageOptions.map((option) => {
									const selected =
										option.code === chosenLanguage;
									return (
										<Pressable
											key={option.code}
											accessibilityRole="radio"
											accessibilityState={{ selected }}
											onPress={() => {
												update("language", option.code);
												setLanguagesOpen(false);
											}}
											style={({ pressed }) => [
												s.langRow,
												s.langRowBorder,
												pressed && s.langPressed,
											]}
										>
											{languageLabel(option)}
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
							</ScrollView>
						)}
					</View>
					<Text style={[s.rowHint, s.langHint]}>
						{t("settings.languageHint")}
					</Text>

					{/* haptics: one master switch; once on, a closed list of per-trigger switches */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("settings.haptics")}
					</Text>
					<View style={s.row}>
						<View style={{ flex: 1, paddingRight: 12 }}>
							<Text style={s.rowTitle}>
								{t("settings.hapticsToggle")}
							</Text>
							<Text style={s.rowHint}>
								{t("settings.hapticsHint")}
							</Text>
						</View>
						<Switch
							value={settings.hapticsEnabled}
							onValueChange={(v) => {
								update("hapticsEnabled", v);
								if (v)
									playHaptic("done"); // a taste of it
								else setHapticsOpen(false);
							}}
							trackColor={{
								true: theme.accent,
								false: "#88888888",
							}}
						/>
					</View>
					{settings.hapticsEnabled && (
						<View style={[s.langCard, { marginTop: 12 }]}>
							<Pressable
								accessibilityRole="button"
								accessibilityState={{ expanded: hapticsOpen }}
								onPress={() => setHapticsOpen((o) => !o)}
								style={({ pressed }) => [
									s.langRow,
									pressed && s.langPressed,
								]}
							>
								<View style={{ flex: 1 }}>
									<Text style={s.rowTitle}>
										{t("settings.hapticsTriggers")}
									</Text>
								</View>
								<Ionicons
									name={
										hapticsOpen
											? "chevron-up"
											: "chevron-down"
									}
									size={22}
									color={theme.text}
								/>
							</Pressable>
							{hapticsOpen &&
								HAPTIC_TRIGGERS.map((id) => (
									<View
										key={id}
										style={[s.langRow, s.langRowBorder]}
									>
										<View
											style={{
												flex: 1,
												paddingRight: 12,
											}}
										>
											<Text style={s.rowTitle}>
												{t(HAPTIC_LABEL[id])}
											</Text>
										</View>
										<Switch
											value={settings.haptics[id]}
											onValueChange={(v) => {
												update("haptics", {
													...settings.haptics,
													[id]: v,
												});
												if (v) playHaptic(id); // preview
											}}
											trackColor={{
												true: theme.accent,
												false: "#88888888",
											}}
										/>
									</View>
								))}
						</View>
					)}

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
					<View style={s.row}>
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
							s.outlineBtn,
							{ borderColor: DANGER },
							pressed && s.pressed,
						]}
					>
						<Text style={[s.outlineBtnText, { color: DANGER }]}>
							{t("settings.resetButton")}
						</Text>
					</Pressable>

					{/* about / credits */}
					<Text style={[s.section, { marginTop: 24 }]}>
						{t("credits.about")}
					</Text>
					<View style={s.rowBlock}>
						<Text style={s.body}>
							{fill(t("credits.idea"), {
								post: link(
									t("credits.ideaPost"),
									LINKS.ideaPost,
								),
								author: link("@rubensmuse", LINKS.ideaSocial),
							})}
						</Text>
						<Text style={[s.body, { marginTop: 8 }]}>
							{fill(t("credits.icons"), {
								ionicons: link("Ionicons", LINKS.ionicons),
								ionic: link("@ionic", LINKS.ionic),
								mdi: link("Material Design Icons", LINKS.mdi),
								pictogrammers: link(
									"@pictogrammers",
									LINKS.pictogrammers,
								),
							})}
						</Text>
						<Text style={[s.body, { marginTop: 8 }]}>
							{fill(t("credits.madeBy"), {
								developer: link(
									"@knownyurimaxxer",
									LINKS.developer,
								),
							})}
						</Text>
						<Text style={[s.rowHint, { marginTop: 12 }]}>
							{t("credits.kofi")}
						</Text>
					</View>
					<Pressable
						accessibilityRole="link"
						onPress={() => open(LINKS.kofi)}
						style={({ pressed }) => [
							s.outlineBtn,
							{ borderColor: theme.accent },
							pressed && s.pressed,
						]}
					>
						<Text
							style={[s.outlineBtnText, { color: theme.accent }]}
						>
							Ko-fi
						</Text>
					</Pressable>
				</ScrollView>
			</View>
		</Modal>
	);
}

const DANGER = "#FF4D4D";

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
		langList: { maxHeight: 280 },
		langPressed: { backgroundColor: t.text + "14" },
		langHint: { color: onBg, opacity: 0.7, marginTop: 8 },
		rowTitle: { color: t.text, fontWeight: "700", fontSize: 15 },
		rowHint: {
			color: t.text + "99",
			fontSize: 13,
			marginTop: 4,
			lineHeight: 18,
		},
		// Buttons wrap to the next line, and a long label wraps inside its button.
		btnRow: {
			flexDirection: "row",
			flexWrap: "wrap",
			gap: 10,
			marginTop: 12,
		},
		btn: {
			maxWidth: "100%",
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
			textAlign: "center",
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
		resetCard: { backgroundColor: t.card, borderRadius: 8, padding: 14 },
		resetText: { color: t.text, fontSize: 13, lineHeight: 18 },
		// Full-width outlined button (reset, Ko-fi); the caller sets the color.
		outlineBtn: {
			alignSelf: "stretch",
			alignItems: "center",
			marginTop: 12,
			paddingVertical: 12,
			paddingHorizontal: 14,
			borderRadius: 10,
			borderWidth: 1,
		},
		outlineBtnText: {
			fontWeight: "700",
			fontSize: 14,
			textAlign: "center",
		},
		pressed: { opacity: 0.6 },
		body: { color: t.text, fontSize: 14, lineHeight: 20 },
		link: {
			color: t.accent,
			fontWeight: "600",
			textDecorationLine: "underline",
		},
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
