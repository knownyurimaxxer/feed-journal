import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
	initialWindowMetrics,
	SafeAreaProvider,
} from "react-native-safe-area-context";
import { useSettings } from "./src/hooks/useSettings";
import { useVault } from "./src/hooks/useVault";
import { useDeviceLanguageTags } from "./src/i18n/device";
import { I18nContext } from "./src/i18n/I18nContext";
import { buildI18n, setActiveTranslator } from "./src/i18n";
import FeedScreen from "./src/screens/FeedScreen";
import { ObsidianContext } from "./src/theme/ObsidianContext";
import { warmDb } from "./src/storage/db";
import { ThemeContext } from "./src/theme/ThemeContext";
import { configureHaptics } from "./src/utils/haptics";
import { readableOn } from "./src/utils/format";

// Keep the splash screen up until the app can show its final layout, and open
// the database right away so it is ready by the time settings are read.
SplashScreen.preventAutoHideAsync().catch(() => {});
warmDb();

/** Longest the splash screen is allowed to stay up if something is slow. */
const SPLASH_MAX_MS = 4000;

/** Icon fonts load lazily, so icons would pop in late. Load them up front. */
function preloadIconFonts(): Promise<unknown> {
	const loadFont = (icons: unknown) =>
		(icons as { loadFont?: () => Promise<void> }).loadFont?.();
	return Promise.allSettled([
		loadFont(Ionicons),
		loadFont(MaterialCommunityIcons),
	]);
}

export default function App() {
	const { settings, ready, update, reset } = useSettings();
	const vault = useVault(settings.obsidianEnabled, settings.vaultUri);
	const deviceLanguages = useDeviceLanguageTags();
	configureHaptics(settings.hapticsEnabled, settings.haptics);
	const [fontsReady, setFontsReady] = useState(false);
	const [feedLoaded, setFeedLoaded] = useState(false);
	const splashHidden = useRef(false);

	useEffect(() => {
		preloadIconFonts().finally(() => setFontsReady(true));
	}, []);

	const hideSplash = useCallback(() => {
		if (splashHidden.current) return;
		splashHidden.current = true;
		SplashScreen.hideAsync().catch(() => {});
	}, []);

	// Settings, icon fonts and the first read of the notes are all done: the
	// screen is in its final shape, so reveal it.
	useEffect(() => {
		if (!ready || !fontsReady || !feedLoaded) return;
		const frame = requestAnimationFrame(hideSplash);
		return () => cancelAnimationFrame(frame);
	}, [ready, fontsReady, feedLoaded, hideSplash]);

	// Safety net: never leave the splash up forever.
	useEffect(() => {
		const timer = setTimeout(hideSplash, SPLASH_MAX_MS);
		return () => clearTimeout(timer);
	}, [hideSplash]);

	const onFeedLoaded = useCallback(() => setFeedLoaded(true), []);
	const i18n = useMemo(() => {
		const built = buildI18n(settings.language, deviceLanguages);
		setActiveTranslator(built.t); // for the few texts outside components
		return built;
	}, [settings.language, deviceLanguages]);

	if (!ready) return null;

	const darkBg = readableOn(settings.theme.background) === "#FFFFFF";

	return (
		<SafeAreaProvider initialMetrics={initialWindowMetrics}>
			<I18nContext.Provider value={i18n}>
				<ThemeContext.Provider value={settings.theme}>
					<ObsidianContext.Provider value={vault.api}>
						<StatusBar style={darkBg ? "light" : "dark"} />
						<FeedScreen
							settings={settings}
							updateSetting={update}
							resetSettings={reset}
							refreshVault={vault.refresh}
							onFirstLoad={onFeedLoaded}
						/>
					</ObsidianContext.Provider>
				</ThemeContext.Provider>
			</I18nContext.Provider>
		</SafeAreaProvider>
	);
}
