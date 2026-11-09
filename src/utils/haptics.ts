import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { HAPTIC_STRENGTH, HapticTrigger } from "../constants";

/**
 * Android: the system's own haptic effects (the ones other apps use, which
 * follow the phone's touch-feedback setting), from the softest step (0) up.
 * The top step (HAPTIC_STRENGTH.max) is the app's original vibration, a
 * selection tick. The order is a best guess: if two steps feel the wrong way
 * round on your phone, just swap their lines here.
 */
const ANDROID_STEPS = [
	"Clock_Tick",
	"Keyboard_Tap",
	"Context_Click",
	"Virtual_Key",
	"Long_Press",
] as const;

/** Plays one step of the strength scale. Other platforms always play the original tick. */
function playStep(step: number): Promise<void> {
	const name = ANDROID_STEPS[step];
	if (Platform.OS === "android" && name !== undefined) {
		try {
			// Older versions of expo-haptics don't have these: fall back to the tick.
			return Haptics.performAndroidHapticsAsync(
				Haptics.AndroidHaptics[name],
			);
		} catch {
			/* fall through */
		}
	}
	return Haptics.selectionAsync();
}

// Every trigger uses the strength chosen in Settings.
const tick = () => playStep(strength);

/** How each trigger feels. */
const FEEL: Record<HapticTrigger, () => Promise<void>> = {
	done: tick,
	save: tick,
	cancel: tick,
	menu: tick,
	action: tick,
	settings: tick,
	refresh: tick,
	compose: tick,
	checklist: tick,
	tag: tick,
	delete: tick,
	error: tick,
};

// The current settings, kept here so any component can call haptic() without
// receiving them as props. App.tsx updates them whenever the settings change.
let enabled = false;
let switches: Partial<Record<HapticTrigger, boolean>> = {};
let strength: number = HAPTIC_STRENGTH.default;

export function configureHaptics(
	on: boolean,
	triggers: Partial<Record<HapticTrigger, boolean>>,
	level: number = HAPTIC_STRENGTH.default,
) {
	enabled = on;
	switches = triggers;
	strength = level;
}

/** Plays one step of the strength scale, for the slider's preview. */
export function previewStrength(step: number) {
	try {
		playStep(step).catch(() => {});
	} catch {
		/* this device can't vibrate */
	}
}

/** Plays a trigger no matter the settings (used for the previews in Settings). */
export function playHaptic(trigger: HapticTrigger) {
	try {
		FEEL[trigger]().catch(() => {});
	} catch {
		/* this device can't vibrate */
	}
}

/** Vibrates for this trigger, if haptics are on and this trigger is on. */
export function haptic(trigger: HapticTrigger) {
	if (!enabled || switches[trigger] === false) return;
	playHaptic(trigger);
}
