import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSettings } from "./src/hooks/useSettings";
import { useVault } from "./src/hooks/useVault";
import FeedScreen from "./src/screens/FeedScreen";
import { ObsidianContext } from "./src/theme/ObsidianContext";
import { ThemeContext } from "./src/theme/ThemeContext";
import { readableOn } from "./src/utils/format";

export default function App() {
	const { settings, ready, update, reset } = useSettings();
	const vault = useVault(settings.obsidianEnabled, settings.vaultUri);

	if (!ready) return null;

	const darkBg = readableOn(settings.theme.background) === "#FFFFFF";

	return (
		<SafeAreaProvider>
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
		</SafeAreaProvider>
	);
}
