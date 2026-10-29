/**
 * Live editing: turns the raw Markdown text into styled pieces, one piece per
 * run of characters. The pieces always add up to exactly the original text
 * (nothing is added or removed), so the text input never gets out of sync.
 *
 * Syntax characters ("**", "## ", "[" and "](url)" of a link, the fences of a code block...) are hidden
 * on lines the cursor is not on, and shown faintly on the line being edited.
 */

import {
	FENCE,
	imageFromMatch,
	INLINE_RE,
	ParseOptions,
	safeHref,
	TASK_RE,
} from "./markdown";

export type Span = {
	text: string;
	/** Syntax characters of a line the cursor is not on: shrunk away. */
	hidden?: boolean;
	/** Syntax characters of the line being edited: shown faintly. */
	dim?: boolean;
	/** List and quote markers: always visible, in the accent color. */
	marker?: boolean;
	bold?: boolean;
	italic?: boolean;
	strike?: boolean;
	code?: boolean;
	/** The visible text of a [text](url) link. */
	link?: boolean;
	/** Inside a fenced code block. */
	block?: boolean;
	/** Heading level (1-6). */
	heading?: number;
	quote?: boolean;
	/** The "[ ]" / "[x]" box of a checklist item. */
	task?: boolean;
	/** Text of a checked checklist item. */
	done?: boolean;
	/** A Markdown image or ![[embed]]: kept visible as a chip (the editor can't draw pictures). */
	image?: boolean;
};

const HEADING = /^(#{1,6})([ \t]+)(.*)$/;
const QUOTE = /^(>[ \t]?)(.*)$/;
const BULLET = /^(\s*[-*+][ \t]+)(.*)$/;
const ORDERED = /^(\s*\d+[.)][ \t]+)(.*)$/;

/** First and last line (0-based) touched by the selection. */
export function activeLineRange(
	text: string,
	sel: { start: number; end: number },
): [number, number] {
	const a = Math.min(sel.start, sel.end);
	const b = Math.max(sel.start, sel.end);
	const lineAt = (upTo: number) => {
		let n = 0;
		for (let i = 0; i < upTo && i < text.length; i++)
			if (text[i] === "\n") n++;
		return n;
	};
	return [lineAt(a), lineAt(b)];
}

/**
 * `active` is the range of lines being edited, or null when nothing is focused.
 * With `opts.obsidian`, "- [ ]" checklists and ![[embeds]] are understood too.
 */
export function liveSpans(
	text: string,
	active: [number, number] | null,
	opts: ParseOptions = {},
): Span[] {
	const obsidian = !!opts.obsidian;
	const lines = text.split("\n");
	const out: Span[] = [];
	let inBlock = false;

	lines.forEach((line, i) => {
		const nl = i < lines.length - 1 ? "\n" : "";
		const isActive = active !== null && i >= active[0] && i <= active[1];
		const syntax = (s: string, flags: Partial<Span> = {}): Span =>
			isActive
				? { ...flags, text: s, dim: true }
				: { ...flags, text: s, hidden: true };
		const push = (s: Span) => {
			if (s.text) out.push(s);
		};

		// Fence lines (```): the whole line, newline included, collapses when not edited.
		if (FENCE.test(line)) {
			push(syntax(line + nl, { block: true }));
			inBlock = !inBlock;
			return;
		}
		if (inBlock) {
			push({ text: line + nl, block: true });
			return;
		}

		const inline = (str: string, flags: Partial<Span>) => {
			let last = 0;
			for (const m of str.matchAll(INLINE_RE)) {
				const start = m.index ?? 0;
				if (start > last)
					push({ ...flags, text: str.slice(last, start) });
				if (m[1] !== undefined) {
					push(syntax("`", flags));
					push({ ...flags, text: m[1], code: true });
					push(syntax("`", flags));
				} else if (m[2] !== undefined) {
					push(syntax("***", flags));
					inline(m[2], { ...flags, bold: true, italic: true });
					push(syntax("***", flags));
				} else if (m[3] !== undefined) {
					push(syntax("**", flags));
					inline(m[3], { ...flags, bold: true });
					push(syntax("**", flags));
				} else if (m[4] !== undefined) {
					push(syntax("~~", flags));
					inline(m[4], { ...flags, strike: true });
					push(syntax("~~", flags));
				} else if (m[5] !== undefined) {
					push(syntax("*", flags));
					inline(m[5], { ...flags, italic: true });
					push(syntax("*", flags));
				} else if (m[8] !== undefined || m[10] !== undefined) {
					// Images stay visible, in full: free of the character count, never hidden.
					if (imageFromMatch(m, obsidian))
						push({ ...flags, text: m[0], marker: true, image: true });
					else push({ ...flags, text: m[0] });
				} else if (safeHref(m[7])) {
					// [text](url): only the text stays visible (as a link) off the active line.
					push(syntax("[", flags));
					inline(m[6], { ...flags, link: true });
					push(syntax(`](${m[7]})`, flags));
				} else {
					// Not an address we are willing to open: plain text, like the renderer shows it.
					push({ ...flags, text: m[0] });
				}
				last = start + m[0].length;
			}
			if (last < str.length) push({ ...flags, text: str.slice(last) });
		};

		let flags: Partial<Span> = {};
		const h = line.match(HEADING);
		const q = line.match(QUOTE);
		const t = obsidian ? line.match(TASK_RE) : null;
		const b = line.match(BULLET) ?? line.match(ORDERED);
		if (h) {
			flags = { heading: h[1].length };
			push(syntax(h[1] + h[2], flags));
			inline(h[3], flags);
		} else if (q) {
			flags = { quote: true };
			push({ text: q[1], marker: true });
			inline(q[2], flags);
		} else if (t) {
			// "- [ ] text": the list marker and the box stay visible; checked text is struck out.
			flags = t[2] === " " ? {} : { done: true };
			push({ text: t[1], marker: true });
			push({ text: `[${t[2]}]`, marker: true, task: true });
			push({ text: t[3] ?? "", marker: true });
			inline(t[4] ?? "", flags);
		} else if (b) {
			push({ text: b[1], marker: true });
			inline(b[2], flags);
		} else {
			inline(line, flags);
		}
		push({ ...flags, text: nl });
	});
	return out;
}
