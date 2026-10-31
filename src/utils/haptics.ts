import * as Haptics from "expo-haptics";
import { HapticTrigger } from "../constants";

// Every trigger uses the faintest feel available.
const tick = () => Haptics.selectionAsync();

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

export function configureHaptics(
	on: boolean,
	triggers: Partial<Record<HapticTrigger, boolean>>,
) {
	enabled = on;
	switches = triggers;
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
