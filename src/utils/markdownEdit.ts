/**
 * Pure helpers behind the editor toolbar. Each takes the current text and
 * selection and returns the new text and selection.
 */
import type { Selection } from "../types";
import { FENCE, IMAGE_RE, LINK_RE, looksLikeUrl } from "./markdown";

export type EditResult = { text: string; selection: Selection };
export type LineKind = "quote" | "bullet" | "ordered" | "heading" | "task";

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
	task: /^[-*+]\s+\[[ xX]\](?:\s+|$)/,
};
// The checklist prefix comes before the plain bullet, so "- [ ] " goes away as a whole.
const ANY_PREFIX =
	/^(?:>\s?|[-*+]\s+\[[ xX]\](?:\s+|$)|[-*+]\s+|\d+[.)]\s+|#{1,6}\s+)/;

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
			// A line that already is a checklist item keeps its box (and whether it is checked).
			if (kind === "task" && re.test(l)) return l;
			const prefix =
				kind === "quote"
					? "> "
					: kind === "bullet"
						? "- "
						: kind === "task"
							? "- [ ] "
							: `${n++}. `;
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

const LINK_PLACEHOLDER = "https://";
const LINK_LABEL = "link text";

/**
 * The link button.
 * - Cursor or selection inside an existing [text](url): removes the link, keeps the text.
 * - Selected text that is itself an address: becomes the target, cursor goes in the empty label.
 * - Any other selection: becomes the label, with the address placeholder selected, ready to paste over.
 * - Nothing selected: inserts a template with its label selected.
 * A selection that crosses lines is left alone (a link can't span lines).
 */
export function toggleLink(text: string, sel: Selection): EditResult {
	const { start, end } = ordered(sel);

	// 1. Already a link? Remove it.
	const lineStart = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
	const found = text.indexOf("\n", lineStart);
	const lineEnd = found === -1 ? text.length : found;
	for (const m of text.slice(lineStart, lineEnd).matchAll(LINK_RE)) {
		const from = lineStart + (m.index ?? 0);
		const to = from + m[0].length;
		// A bare cursor right at either edge of the link is outside it.
		const edge = start === end && (start === from || start === to);
		if (start < from || end > to || edge) continue;
		if (from > 0 && text[from - 1] === "!") continue; // that is an image, not a link
		return {
			text: text.slice(0, from) + m[1] + text.slice(to),
			selection: { start: from, end: from + m[1].length },
		};
	}

	const before = text.slice(0, start);
	const mid = text.slice(start, end);
	const after = text.slice(end);
	if (mid.includes("\n")) return { text, selection: { start, end } };

	// 2. The selection is an address: it becomes the target of an empty label.
	if (looksLikeUrl(mid)) {
		return {
			text: `${before}[](${mid})${after}`,
			selection: { start: start + 1, end: start + 1 },
		};
	}

	// 3. Plain text selected: it becomes the label.
	if (mid) {
		const open = `[${mid}](`;
		const s = start + open.length;
		return {
			text: `${before}${open}${LINK_PLACEHOLDER})${after}`,
			selection: { start: s, end: s + LINK_PLACEHOLDER.length },
		};
	}

	// 4. Nothing selected: template with the label selected.
	return {
		text: `${before}[${LINK_LABEL}](${LINK_PLACEHOLDER})${after}`,
		selection: { start: start + 1, end: start + 1 + LINK_LABEL.length },
	};
}

const IMAGE_PLACEHOLDER = "https://";

/**
 * The image button.
 * - Cursor or selection inside an existing ![alt](url): removes the image, keeps the description.
 * - Selected text that is a web address: becomes the image, cursor goes in the empty description.
 * - Any other selection: becomes the description, with the address placeholder selected.
 * - Nothing selected: inserts ![](https://) with the placeholder selected, ready to paste over.
 * A selection that crosses lines is left alone (an image can't span lines).
 */
export function toggleImage(text: string, sel: Selection): EditResult {
	const { start, end } = ordered(sel);

	// 1. Already an image? Remove it.
	const lineStart = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
	const found = text.indexOf("\n", lineStart);
	const lineEnd = found === -1 ? text.length : found;
	for (const m of text.slice(lineStart, lineEnd).matchAll(IMAGE_RE)) {
		const from = lineStart + (m.index ?? 0);
		const to = from + m[0].length;
		const edge = start === end && (start === from || start === to);
		if (start < from || end > to || edge) continue;
		return {
			text: text.slice(0, from) + m[1] + text.slice(to),
			selection: { start: from, end: from + m[1].length },
		};
	}

	const before = text.slice(0, start);
	const mid = text.slice(start, end);
	const after = text.slice(end);
	if (mid.includes("\n")) return { text, selection: { start, end } };

	// 2. The selection is a web address: it becomes the image.
	if (/^https?:\/\/\S+$/i.test(mid)) {
		return {
			text: `${before}![](${mid})${after}`,
			selection: { start: start + 2, end: start + 2 },
		};
	}

	// 3 and 4. Selected text becomes the description; with nothing selected it stays empty.
	const open = `![${mid}](`;
	const s = start + open.length;
	return {
		text: `${before}${open}${IMAGE_PLACEHOLDER})${after}`,
		selection: { start: s, end: s + IMAGE_PLACEHOLDER.length },
	};
}

/* ---- checklists ---- */

/** "- [ ]" or "- [x]" at the start of a line. Groups: 1 everything before the box content, 2 the content, 3 the closing "]". */
const TASK_BOX = /^(\s*[-*+][ \t]+\[)([ xX])(\])/;

/** Number of the line (0-based) that character `pos` is on. */
function lineIndexAt(text: string, pos: number): number {
	let n = 0;
	for (let i = 0; i < pos && i < text.length; i++) if (text[i] === "\n") n++;
	return n;
}

/** A checklist item that is not inside a fenced code block. */
function isTaskLine(lines: string[], i: number): boolean {
	if (!TASK_BOX.test(lines[i])) return false;
	let fences = 0;
	for (let k = 0; k < i; k++) if (FENCE.test(lines[k])) fences++;
	return fences % 2 === 0;
}

/** Flips the box of the checklist item on line `line` (0-based). Anything else comes back unchanged. */
export function toggleTaskLine(text: string, line: number): string {
	const lines = text.split("\n");
	if (line < 0 || line >= lines.length || !isTaskLine(lines, line)) return text;
	lines[line] = lines[line].replace(
		TASK_BOX,
		(_all, open: string, mark: string, close: string) =>
			open + (mark === " " ? "x" : " ") + close,
	);
	return lines.join("\n");
}

/**
 * Tapping a checklist box in the editor. The text input only tells us where
 * the cursor went, so a tap is a cursor that JUMPED to between the "[" and
 * "]" of a box. Moving by one character (typing, arrow keys, swiping on the
 * space bar) is never a tap. The cursor then goes to the end of the line, so
 * tapping the same box again is a jump again.
 * Returns null when this was not a tap on a box.
 */
export function toggleTaskAtTap(
	text: string,
	prev: Selection,
	next: Selection,
): EditResult | null {
	if (next.start !== next.end) return null;
	const caret = next.start;
	if (prev.start === prev.end && Math.abs(caret - prev.start) <= 1) return null;

	const lineStart = caret === 0 ? 0 : text.lastIndexOf("\n", caret - 1) + 1;
	const found = text.indexOf("\n", lineStart);
	const lineEnd = found === -1 ? text.length : found;
	const m = text.slice(lineStart, lineEnd).match(TASK_BOX);
	if (!m) return null;
	const bracket = lineStart + m[1].length - 1; // where the "[" is
	if (caret <= bracket || caret >= bracket + 3) return null;

	const toggled = toggleTaskLine(text, lineIndexAt(text, caret));
	if (toggled === text) return null;
	return { text: toggled, selection: { start: lineEnd, end: lineEnd } };
}
