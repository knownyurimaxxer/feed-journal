/**
 * Pure helpers behind the editor toolbar. Each takes the current text and
 * selection and returns the new text and selection.
 */
import type { Selection } from "../types";

export type EditResult = { text: string; selection: Selection };
export type LineKind = "quote" | "bullet" | "ordered" | "heading";

const ordered = (s: Selection): Selection => ({
	start: Math.min(s.start, s.end),
	end: Math.max(s.start, s.end),
});

/** Length of the run of `ch` at the start (or end) of `s`. */
function run(s: string, ch: string, fromEnd: boolean): number {
	let n = 0;
	while (n < s.length && s[fromEnd ? s.length - 1 - n : n] === ch) n++;
	return n;
}

/**
 * Toggles an inline marker (**, *, ~~, `) around the selection.
 * With nothing selected it inserts an empty pair and puts the cursor inside.
 */
export function toggleWrap(
	text: string,
	sel: Selection,
	open: string,
	close: string = open,
): EditResult {
	const { start, end } = ordered(sel);
	const before = text.slice(0, start);
	const mid = text.slice(start, end);
	const after = text.slice(end);

	// "*" is shared with bold ("**"), so count the stars: an odd run means italic is on.
	const isItalic = open === "*";
	const outerOn = isItalic
		? Math.min(run(before, "*", true), run(after, "*", false)) % 2 === 1
		: before.endsWith(open) && after.startsWith(close);
	const innerOn = isItalic
		? mid.length >= 2 &&
			Math.min(run(mid, "*", false), run(mid, "*", true)) % 2 === 1
		: mid.length >= open.length + close.length &&
			mid.startsWith(open) &&
			mid.endsWith(close);

	if (outerOn) {
		return {
			text:
				before.slice(0, before.length - open.length) +
				mid +
				after.slice(close.length),
			selection: { start: start - open.length, end: end - open.length },
		};
	}
	if (innerOn) {
		const inner = mid.slice(open.length, mid.length - close.length);
		return {
			text: before + inner + after,
			selection: { start, end: start + inner.length },
		};
	}
	return {
		text: before + open + mid + close + after,
		selection: { start: start + open.length, end: end + open.length },
	};
}

/** Wraps the selection in a fenced code block, or removes the fences if already there. */
export function toggleCodeBlock(text: string, sel: Selection): EditResult {
	const { start, end } = ordered(sel);
	const before = text.slice(0, start);
	const mid = text.slice(start, end);
	const after = text.slice(end);
	const open = "```\n";
	const close = "\n```";

	if (before.endsWith(open) && after.startsWith(close)) {
		return {
			text:
				before.slice(0, before.length - open.length) +
				mid +
				after.slice(close.length),
			selection: { start: start - open.length, end: end - open.length },
		};
	}
	if (
		mid.length >= open.length + close.length &&
		mid.startsWith(open) &&
		mid.endsWith(close)
	) {
		const inner = mid.slice(open.length, mid.length - close.length);
		return {
			text: before + inner + after,
			selection: { start, end: start + inner.length },
		};
	}
	const lead = before === "" || before.endsWith("\n") ? "" : "\n";
	const trail = after === "" || after.startsWith("\n") ? "" : "\n";
	const s = before.length + lead.length + open.length;
	return {
		text: before + lead + open + mid + close + trail + after,
		selection: { start: s, end: s + mid.length },
	};
}

const PREFIX: Record<Exclude<LineKind, "heading">, RegExp> = {
	quote: /^>\s?/,
	bullet: /^[-*+]\s+/,
	ordered: /^\d+[.)]\s+/,
};
const ANY_PREFIX = /^(?:>\s?|[-*+]\s+|\d+[.)]\s+|#{1,6}\s+)/;

/**
 * Toggles a line prefix on every line the selection touches.
 * Headings cycle "## " -> "### " -> none (the title has its own field, so the
 * toolbar never creates an H1).
 */
export function toggleLinePrefix(
	text: string,
	sel: Selection,
	kind: LineKind,
): EditResult {
	const { start, end } = ordered(sel);
	const lineStart = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
	// A selection that ends right after a newline should not drag in the next line.
	const last = end > start && text[end - 1] === "\n" ? end - 1 : end;
	const found = text.indexOf("\n", last);
	const lineEnd = found === -1 ? text.length : found;

	const block = text.slice(lineStart, lineEnd);
	const lines = block.split("\n");
	// A lone empty line still gets the prefix; blank lines inside a range are skipped.
	const active = (l: string) => l.trim() !== "" || lines.length === 1;
	const strip = (l: string) => l.replace(ANY_PREFIX, "");

	let out: string[];
	if (kind === "heading") {
		const levels = lines
			.filter(active)
			.map((l) => l.match(/^(#{1,6})\s+/)?.[1].length ?? 0);
		const same = levels.length > 0 && levels.every((v) => v === levels[0]);
		const current = same ? levels[0] : 0;
		const next = current === 2 ? 3 : current === 3 ? 0 : 2;
		out = lines.map((l) =>
			active(l) ? (next ? "#".repeat(next) + " " : "") + strip(l) : l,
		);
	} else {
		const re = PREFIX[kind];
		const all = lines.filter(active);
		const allHave = all.length > 0 && all.every((l) => re.test(l));
		let n = 1;
		out = lines.map((l) => {
			if (!active(l)) return l;
			if (allHave) return strip(l);
			const prefix =
				kind === "quote" ? "> " : kind === "bullet" ? "- " : `${n++}. `;
			return prefix + strip(l);
		});
	}

	const newBlock = out.join("\n");
	const delta = newBlock.length - block.length;
	return {
		text: text.slice(0, lineStart) + newBlock + text.slice(lineEnd),
		selection:
			start === end
				? { start: lineEnd + delta, end: lineEnd + delta }
				: { start: lineStart, end: lineEnd + delta },
	};
}
