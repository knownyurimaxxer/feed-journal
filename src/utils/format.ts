import type { Theme } from "../types";

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

export function timeAgo(ts: number): string {
	const s = Math.floor((Date.now() - ts) / 1000);
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)}m`;
	if (s < 86400) return `${Math.floor(s / 3600)}h`;
	if (s < 604800) return `${Math.floor(s / 86400)}d`;
	return new Date(ts).toLocaleDateString();
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
export function folderLabel(uri: string | null): string {
	if (!uri) return "App storage (default)";
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
