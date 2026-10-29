/**
 * Minimal Markdown block parser for the subset the editor can produce:
 * headings, quotes, fenced code, bullet and numbered lists, paragraphs.
 * With Obsidian compatibility on, "- [ ] task" lines become checklist items.
 * Inline formatting (bold, italic, strike, code, links, images) is handled by the renderer.
 */

/** `obsidian`: Obsidian compatibility is on (checklists, ![[image]] embeds, vault image paths). */
export type ParseOptions = { obsidian?: boolean };

export type Block =
	| { type: "heading"; level: number; text: string }
	| { type: "quote"; lines: string[] }
	| { type: "code"; text: string }
	| { type: "bullet"; text: string }
	| { type: "ordered"; n: number; text: string }
	/** `line` is the 0-based line of the item, so a tap can flip its box in the note text. */
	| { type: "task"; checked: boolean; text: string; line: number }
	| { type: "paragraph"; text: string }
	| { type: "blank" };

/** A line that opens or closes a fenced code block. */
export const FENCE = /^\s*```/;

/** A checklist line "- [ ] text". Groups: 1 list marker, 2 box content (" ", "x" or "X"), 3 spacing, 4 text. */
export const TASK_RE = /^(\s*[-*+][ \t]+)\[([ xX])\](?:([ \t]+)(.*))?$/;

export function parseBlocks(md: string, opts: ParseOptions = {}): Block[] {
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

		const task = opts.obsidian ? line.match(TASK_RE) : null;
		if (task) {
			blocks.push({
				type: "task",
				checked: task[2] !== " ",
				text: task[4] ?? "",
				line: i,
			});
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

/** Where an image comes from: a web address, or a file in the Obsidian vault. */
export type ImageRef =
	| { kind: "web"; url: string }
	| { kind: "vault"; path: string };

export type ImageInline = {
	type: "image";
	image: ImageRef;
	alt: string;
	/** From ![[a.png|300]] or ![alt|300x200](url). */
	width?: number;
	height?: number;
};

export type Inline =
	| { type: "text"; text: string }
	| { type: "code"; text: string }
	| { type: "bold" | "italic" | "strike"; children: Inline[] }
	| { type: "link"; href: string; children: Inline[] }
	| ImageInline;

// Order matters: `code`, ***bold italic***, **bold**, ~~strike~~, *italic*,
// [link text](url). Markers must hug the text ("2 * 3 * 4" is not italic).
// Groups: 1 code, 2 bold italic, 3 bold, 4 strike, 5 italic, 6 link text, 7 link url,
// 8 ![[embed]] (target and options), 9 ![alt](url) alt, 10 ![alt](url) url.
// The url may hold one level of parentheses, e.g. (https://en.wikipedia.org/wiki/Foo_(bar)).
// Images start with "!", which no other branch matches, so their place in the order is free.
export const INLINE_RE =
	/`([^`\n]+)`|\*\*\*(\S(?:[^*]*?\S)??)\*\*\*|\*\*(\S(?:.*?\S)??)\*\*|~~(\S(?:.*?\S)??)~~|\*(\S(?:[^*]*?\S)??)\*|\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|!\[\[([^\]\n]+)\]\]|!\[([^\]\n]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

/** Just a Markdown image: ![alt](url). Groups: 1 alt, 2 url. Same pattern as the last branch of INLINE_RE. */
export const IMAGE_RE =
	/!\[([^\]\n]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

/** Just the link: [text](url). Groups: 1 text, 2 url. Same pattern as the last branch of INLINE_RE. */
export const LINK_RE =
	/\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

const SCHEME_URL = /^(?:https?:\/\/|mailto:)\S+$/i;
// "example.com", "www.example.com/path", "example.com:8080": no scheme, but clearly a web address.
const BARE_URL =
	/^(?:www\.|[a-z0-9-]+(?:\.[a-z0-9-]+)+)(?::\d+)?(?:[/?#]\S*)?$/i;

/**
 * The address a link may open, or null when it must not be a link at all.
 * Only http, https and mailto are allowed ("javascript:" and friends never
 * become links). A bare address like "example.com" gets "https://" in front.
 */
export function safeHref(url: string): string | null {
	const u = url.trim();
	if (SCHEME_URL.test(u)) return u;
	if (BARE_URL.test(u)) return `https://${u}`;
	return null;
}

/** True when `s` is, on its own, clearly a web or e-mail address (used by the link toolbar button). */
export function looksLikeUrl(s: string): boolean {
	return /^(?:https?:\/\/|mailto:|www\.)\S+$/i.test(s);
}

const WEB_IMAGE = /^https?:\/\/\S+$/i;
/** File types an image can have inside the vault (what the phone can draw). */
export const IMAGE_EXT = /\.(?:png|jpe?g|gif|webp|bmp)$/i;
const SIZE = /^(\d{1,4})(?:x(\d{1,4}))?$/;

/**
 * Where an image address points, or null when it must not be drawn:
 * - http(s) addresses always work;
 * - anything else is a path inside the Obsidian vault, and only with
 *   Obsidian compatibility on and a picture file extension.
 */
export function imageRef(target: string, obsidian: boolean): ImageRef | null {
	const t = target.trim();
	if (WEB_IMAGE.test(t)) return { kind: "web", url: t };
	if (!obsidian) return null;
	let p = t;
	try {
		p = decodeURIComponent(p); // "my%20photo.png"
	} catch {
		/* not encoded: keep it */
	}
	p = p
		.replace(/[#^].*$/, "") // ![[a.png#anchor]]
		.replace(/\\/g, "/")
		.replace(/^(?:\.\/|\/)+/, "")
		.trim();
	return p && IMAGE_EXT.test(p) ? { kind: "vault", path: p } : null;
}

/** "alt text|300x200" -> description and size. A last part that isn't a size stays in the description. */
function labelParts(label: string): {
	alt: string;
	width?: number;
	height?: number;
} {
	const parts = label.split("|");
	const m = parts[parts.length - 1].trim().match(SIZE);
	if (!m) return { alt: label.trim() };
	const out = { alt: parts.slice(0, -1).join("|").trim(), width: Number(m[1]) };
	return m[2] ? { ...out, height: Number(m[2]) } : out;
}

/**
 * The image behind a match of INLINE_RE (groups 8 to 10), or null when the
 * match is not an image we can show (it is then kept as plain text).
 */
export function imageFromMatch(
	m: RegExpMatchArray,
	obsidian: boolean,
): ImageInline | null {
	if (m[8] !== undefined) {
		if (!obsidian) return null;
		const bar = m[8].indexOf("|");
		const target = bar < 0 ? m[8] : m[8].slice(0, bar);
		const label = bar < 0 ? "" : m[8].slice(bar + 1);
		const ref = imageRef(target, true);
		return ref && { type: "image", image: ref, ...labelParts(label) };
	}
	if (m[10] !== undefined) {
		const ref = imageRef(m[10], obsidian);
		return ref && { type: "image", image: ref, ...labelParts(m[9] ?? "") };
	}
	return null;
}

/**
 * The images a text shows, in order: the ones standing directly in a line
 * of text (not inside bold, a link...), which is where the post draws them.
 */
export function collectImages(md: string, opts: ParseOptions = {}): ImageInline[] {
	const out: ImageInline[] = [];
	const scan = (text: string) => {
		for (const n of parseInline(text, opts)) if (n.type === "image") out.push(n);
	};
	for (const b of parseBlocks(md, opts)) {
		if (b.type === "quote") b.lines.forEach(scan);
		else if (
			b.type === "paragraph" ||
			b.type === "bullet" ||
			b.type === "ordered" ||
			b.type === "task"
		)
			scan(b.text);
	}
	return out;
}

export function parseInline(text: string, opts: ParseOptions = {}): Inline[] {
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
				children: [{ type: "italic", children: parseInline(m[2], opts) }],
			});
		} else if (m[3] !== undefined) {
			out.push({ type: "bold", children: parseInline(m[3], opts) });
		} else if (m[4] !== undefined) {
			out.push({ type: "strike", children: parseInline(m[4], opts) });
		} else if (m[5] !== undefined) {
			out.push({ type: "italic", children: parseInline(m[5], opts) });
		} else if (m[8] !== undefined || m[10] !== undefined) {
			// An image, or the text of one we won't draw.
			out.push(
				imageFromMatch(m, !!opts.obsidian) ?? {
					type: "text",
					text: m[0],
				},
			);
		} else {
			const href = safeHref(m[7]);
			if (href) {
				out.push({
					type: "link",
					href,
					children: parseInline(m[6], opts),
				});
			} else {
				// Not an address we are willing to open: keep it as plain text.
				out.push({ type: "text", text: m[0] });
			}
		}
		last = start + m[0].length;
	}
	if (last < text.length) out.push({ type: "text", text: text.slice(last) });
	return out;
}
