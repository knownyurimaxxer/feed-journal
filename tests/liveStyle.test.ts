import { describe, expect, it } from "vitest";
import { activeLineRange, liveSpans } from "../src/utils/liveStyle";

const SAMPLES = [
	"",
	"plain",
	"**bold** and *italic* and ~~strike~~ and `code`",
	"***both***",
	"# one\n## two\n### three",
	"> quote with **bold**",
	"- item\n* item\n+ item\n1. one\n2) two",
	"```\ncode **not bold**\n```\nafter",
	"```\nunclosed",
	"line\n\n\nlines\n",
	"2 * 3 * 4 and **",
	"emoji 😀 **bold 😀**",
	"a [link](https://a.com) and **[b](http://b.org)**",
	"[bad](javascript:x) and [half](https://",
	"- [ ] todo\n- [x] done **bold**\n* [X] up\n- [ ]\n- [ ]no",
	"![[a b.png|200]] and ![alt|10x10](https://a.com/i.png) and ![](https://",
	"```\n- [ ] in code\n```",
];

const ACTIVE_RANGES: ([number, number] | null)[] = [
	null,
	[0, 0],
	[1, 2],
	[0, 99],
];

describe("liveSpans", () => {
	it("never adds or removes characters (the input must stay in sync)", () => {
		for (const text of SAMPLES) {
			for (const active of ACTIVE_RANGES) {
				const spans = liveSpans(text, active);
				expect(spans.map((s) => s.text).join("")).toBe(text);
			}
		}
	});

	it("never adds or removes characters with Obsidian compatibility on", () => {
		for (const text of SAMPLES) {
			for (const active of ACTIVE_RANGES) {
				const spans = liveSpans(text, active, { obsidian: true });
				expect(spans.map((s) => s.text).join("")).toBe(text);
			}
		}
	});

	it("hides syntax on lines the cursor is not on", () => {
		const spans = liveSpans("**hi**", null);
		expect(spans).toEqual([
			{ text: "**", hidden: true },
			{ text: "hi", bold: true },
			{ text: "**", hidden: true },
		]);
	});

	it("shows syntax faintly on the line being edited", () => {
		const spans = liveSpans("**hi**", [0, 0]);
		expect(spans[0]).toEqual({ text: "**", dim: true });
		expect(spans[2]).toEqual({ text: "**", dim: true });
	});

	it("styles headings and keeps the # visible only while editing", () => {
		expect(liveSpans("## hi", null)[0]).toEqual({
			text: "## ",
			heading: 2,
			hidden: true,
		});
		expect(liveSpans("## hi", [0, 0])[0]).toEqual({
			text: "## ",
			heading: 2,
			dim: true,
		});
	});

	it("keeps list markers visible", () => {
		expect(liveSpans("- a", null)[0]).toEqual({ text: "- ", marker: true });
	});

	it("marks everything between fences as a code block", () => {
		const spans = liveSpans("```\nx **y**\n```", null);
		expect(spans[1]).toEqual({ text: "x **y**\n", block: true });
	});

	it("does not style lone asterisks", () => {
		const spans = liveSpans("2 * 3 * 4", null);
		expect(spans).toEqual([{ text: "2 * 3 * 4" }]);
	});
});

describe("activeLineRange", () => {
	it("finds the line of a cursor", () => {
		expect(activeLineRange("a\nb\nc", { start: 2, end: 2 })).toEqual([
			1, 1,
		]);
	});

	it("spans several lines for a selection", () => {
		expect(activeLineRange("a\nb\nc", { start: 0, end: 4 })).toEqual([
			0, 2,
		]);
	});

	it("accepts a backwards selection", () => {
		expect(activeLineRange("a\nb", { start: 3, end: 0 })).toEqual([0, 1]);
	});
});

describe("live styling matches what posts render", () => {
	it("formats the same words as the post renderer", async () => {
		const { parseInline } = await import("../src/utils/markdown");
		const text = "a **b** *c* ~~d~~ `e`";
		const rendered = parseInline(text).filter(
			(n) => n.type !== "text",
		).length;
		const live = liveSpans(text, null).filter(
			(s) => s.bold || s.italic || s.strike || s.code,
		).length;
		expect(live).toBe(rendered);
	});
});

describe("liveSpans links", () => {
	it("hides the brackets and url off the active line", () => {
		expect(liveSpans("[hi](https://a.com)", null)).toEqual([
			{ text: "[", hidden: true },
			{ text: "hi", link: true },
			{ text: "](https://a.com)", hidden: true },
		]);
	});

	it("shows the syntax faintly on the active line", () => {
		expect(liveSpans("[hi](https://a.com)", [0, 0])).toEqual([
			{ text: "[", dim: true },
			{ text: "hi", link: true },
			{ text: "](https://a.com)", dim: true },
		]);
	});

	it("leaves an unusable address as plain text", () => {
		expect(liveSpans("[hi](https://)", null)).toEqual([
			{ text: "[hi](https://)" },
		]);
	});
});

describe("liveSpans checklists", () => {
	const on = { obsidian: true };

	it("keeps the marker and the box visible, even on other lines", () => {
		expect(liveSpans("- [ ] a", null, on)).toEqual([
			{ text: "- ", marker: true },
			{ text: "[ ]", marker: true, task: true },
			{ text: " ", marker: true },
			{ text: "a" },
		]);
	});

	it("marks the text of a checked item as done", () => {
		const spans = liveSpans("- [x] a **b**", null, on);
		expect(spans[1]).toEqual({ text: "[x]", marker: true, task: true });
		expect(spans.filter((s) => s.done).map((s) => s.text)).toContain("a ");
		expect(spans.find((s) => s.bold)).toMatchObject({ text: "b", done: true });
	});

	it("is a plain bullet when Obsidian compatibility is off", () => {
		expect(liveSpans("- [ ] a", null)).toEqual([
			{ text: "- ", marker: true },
			{ text: "[ ] a" },
		]);
	});

	it("does not treat a missing space as a checklist", () => {
		expect(liveSpans("- [ ]a", null, on)[0]).toEqual({ text: "- ", marker: true });
		expect(liveSpans("- [ ]a", null, on)).toHaveLength(2);
	});
});

describe("liveSpans images", () => {
	const on = { obsidian: true };

	it("keeps a Markdown image visible in full, as a chip", () => {
		expect(liveSpans("![a](https://a.com/i.png)", null)).toEqual([
			{ text: "![a](https://a.com/i.png)", marker: true, image: true },
		]);
	});

	it("shows ![[embeds]] as chips only with Obsidian compatibility", () => {
		expect(liveSpans("![[a.png]]", null, on)).toEqual([
			{ text: "![[a.png]]", marker: true, image: true },
		]);
		expect(liveSpans("![[a.png]]", null)).toEqual([{ text: "![[a.png]]" }]);
	});

	it("leaves unusable images as plain text", () => {
		expect(liveSpans("![](https://)", null, on)).toEqual([{ text: "![](https://)" }]);
	});
});
