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
