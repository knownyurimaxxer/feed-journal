/**
 * Minimal Markdown block parser for the subset the editor can produce:
 * headings, quotes, fenced code, bullet and numbered lists, paragraphs.
 * Inline formatting (bold, italic, strike, code) is handled by the renderer.
 */
export type Block =
	| { type: "heading"; level: number; text: string }
	| { type: "quote"; lines: string[] }
	| { type: "code"; text: string }
	| { type: "bullet"; text: string }
	| { type: "ordered"; n: number; text: string }
	| { type: "paragraph"; text: string }
	| { type: "blank" };

/** A line that opens or closes a fenced code block. */
export const FENCE = /^\s*```/;

export function parseBlocks(md: string): Block[] {
	const lines = md.replace(/\r\n?/g, "\n").split("\n");
	const blocks: Block[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		if (FENCE.test(line)) {
			const code: string[] = [];
			i++;
			while (i < lines.length && !FENCE.test(lines[i]))
				code.push(lines[i++]);
			blocks.push({ type: "code", text: code.join("\n") });
			continue; // i is on the closing fence (or past the end); the loop skips it
		}

		if (!line.trim()) {
			if (blocks.length && blocks[blocks.length - 1].type !== "blank") {
				blocks.push({ type: "blank" });
			}
			continue;
		}

		const h = line.match(/^(#{1,6})\s+(.*\S)\s*$/);
		if (h) {
			blocks.push({ type: "heading", level: h[1].length, text: h[2] });
			continue;
		}

		if (line.startsWith(">")) {
			const quote: string[] = [];
			while (i < lines.length && lines[i].startsWith(">")) {
				quote.push(lines[i++].replace(/^>\s?/, ""));
			}
			i--; // the loop increments again
			blocks.push({ type: "quote", lines: quote });
			continue;
		}

		const b = line.match(/^\s*[-*+]\s+(.*)$/);
		if (b) {
			blocks.push({ type: "bullet", text: b[1] });
			continue;
		}

		const o = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
		if (o) {
			blocks.push({ type: "ordered", n: Number(o[1]), text: o[2] });
			continue;
		}

		blocks.push({ type: "paragraph", text: line });
	}

	while (blocks.length && blocks[blocks.length - 1].type === "blank")
		blocks.pop();
	return blocks;
}

/* ---- inline formatting ---- */

export type Inline =
	| { type: "text"; text: string }
	| { type: "code"; text: string }
	| { type: "bold" | "italic" | "strike"; children: Inline[] };

// Order matters: `code`, ***bold italic***, **bold**, ~~strike~~, *italic*.
// Markers must hug the text ("2 * 3 * 4" is not italic).
export const INLINE_RE =
	/`([^`\n]+)`|\*\*\*(\S(?:[^*]*?\S)??)\*\*\*|\*\*(\S(?:.*?\S)??)\*\*|~~(\S(?:.*?\S)??)~~|\*(\S(?:[^*]*?\S)??)\*/g;

export function parseInline(text: string): Inline[] {
	const out: Inline[] = [];
	let last = 0;
	for (const m of text.matchAll(INLINE_RE)) {
		const start = m.index ?? 0;
		if (start > last)
			out.push({ type: "text", text: text.slice(last, start) });
		if (m[1] !== undefined) {
			out.push({ type: "code", text: m[1] });
		} else if (m[2] !== undefined) {
			out.push({
				type: "bold",
				children: [{ type: "italic", children: parseInline(m[2]) }],
			});
		} else if (m[3] !== undefined) {
			out.push({ type: "bold", children: parseInline(m[3]) });
		} else if (m[4] !== undefined) {
			out.push({ type: "strike", children: parseInline(m[4]) });
		} else {
			out.push({ type: "italic", children: parseInline(m[5]) });
		}
		last = start + m[0].length;
	}
	if (last < text.length) out.push({ type: "text", text: text.slice(last) });
	return out;
}
