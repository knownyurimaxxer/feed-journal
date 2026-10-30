import { makeTranslator, Translate } from "../i18n";
import { en } from "../i18n/locales/en";
import type { Theme } from "../types";

/** What these helpers say when no translator is given. */
const english = makeTranslator(en);

/** Black or white, whichever is readable on top of `hex`. */
export function readableOn(hex: string): "#000000" | "#FFFFFF" {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
		? "#000000"
		: "#FFFFFF";
}

/** WCAG relative luminance of a #RRGGBB color (0 = black, 1 = white). */
function luminance(hex: string): number {
	const h = hex.replace("#", "");
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(h.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #RRGGBB colors (1 = identical, 21 = black on white). */
export function contrastRatio(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * Color for links on a post card: the accent, unless the accent is too faint on
 * the card (light blue on white, say), then the text color. Links are always underlined.
 */
export function linkColor(t: Theme): string {
	return contrastRatio(t.accent, t.card) >= 3 ? t.accent : t.text;
}

/** "just now", "5m", "3h", "2d", then the date. `t` and `locale` come from useI18n(). */
export function timeAgo(
	ts: number,
	t: Translate = english,
	locale?: string,
): string {
	const s = Math.floor((Date.now() - ts) / 1000);
	if (s < 60) return t("time.now");
	if (s < 3600) return t("time.minutes", { n: Math.floor(s / 60) });
	if (s < 86400) return t("time.hours", { n: Math.floor(s / 3600) });
	if (s < 604800) return t("time.days", { n: Math.floor(s / 86400) });
	return new Date(ts).toLocaleDateString(locale);
}

/* ---- note ids: "2026-10-28_14-03-22_ab12" (file name without .md) ---- */

const pad = (n: number) => String(n).padStart(2, "0");

export function newNoteId(d: Date = new Date()): string {
	const stamp =
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_` +
		`${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
	const rand = Math.random().toString(36).slice(2, 6).padEnd(4, "0");
	return `${stamp}_${rand}`;
}

export function parseIdDate(id: string): number | null {
	const m = id.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/);
	if (!m) return null;
	const [, y, mo, d, h, mi, s] = m.map(Number);
	return new Date(y, mo - 1, d, h, mi, s).getTime();
}

/** Short human label for a folder URI. */
export function folderLabel(
	uri: string | null,
	t: Translate = english,
): string {
	if (!uri) return t("folder.appStorage");
	try {
		const last = decodeURIComponent(uri)
			.split(/[/:]/)
			.filter(Boolean)
			.pop();
		return last || uri;
	} catch {
		return uri;
	}
}
