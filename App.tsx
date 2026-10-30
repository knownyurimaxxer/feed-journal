import { useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSettings } from "./src/hooks/useSettings";
import { useVault } from "./src/hooks/useVault";
import { useDeviceLanguageTags } from "./src/i18n/device";
import { I18nContext } from "./src/i18n/I18nContext";
import { buildI18n, setActiveTranslator } from "./src/i18n";
import FeedScreen from "./src/screens/FeedScreen";
import { ObsidianContext } from "./src/theme/ObsidianContext";
import { ThemeContext } from "./src/theme/ThemeContext";
import { readableOn } from "./src/utils/format";

export default function App() {
	const { settings, ready, update, reset } = useSettings();
	const vault = useVault(settings.obsidianEnabled, settings.vaultUri);
	const deviceLanguages = useDeviceLanguageTags();
	const i18n = useMemo(() => {
		const built = buildI18n(settings.language, deviceLanguages);
		setActiveTranslator(built.t); // for the few texts outside components
		return built;
	}, [settings.language, deviceLanguages]);

	if (!ready) return null;

	const darkBg = readableOn(settings.theme.background) === "#FFFFFF";

	return (
		<SafeAreaProvider>
			<I18nContext.Provider value={i18n}>
				<ThemeContext.Provider value={settings.theme}>
					<ObsidianContext.Provider value={vault.api}>
						<StatusBar style={darkBg ? "light" : "dark"} />
						<FeedScreen
							settings={settings}
							updateSetting={update}
							resetSettings={reset}
							refreshVault={vault.refresh}
						/>
					</ObsidianContext.Provider>
				</ThemeContext.Provider>
			</I18nContext.Provider>
		</SafeAreaProvider>
	);
}
