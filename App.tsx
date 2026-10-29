import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSettings } from "./src/hooks/useSettings";
import FeedScreen from "./src/screens/FeedScreen";
import { ThemeContext } from "./src/theme/ThemeContext";
import { readableOn } from "./src/utils/format";

export default function App() {
	const { settings, ready, update, reset } = useSettings();

	if (!ready) return null;

	const darkBg = readableOn(settings.theme.background) === "#FFFFFF";

	return (
		<SafeAreaProvider>
			<ThemeContext.Provider value={settings.theme}>
				<StatusBar style={darkBg ? "light" : "dark"} />
				<FeedScreen
					settings={settings}
					updateSetting={update}
					resetSettings={reset}
				/>
			</ThemeContext.Provider>
		</SafeAreaProvider>
	);
}
