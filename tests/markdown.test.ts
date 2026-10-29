import { describe, expect, it } from "vitest";
import { parseBlocks, parseInline } from "../src/utils/markdown";

describe("parseBlocks", () => {
	it("reads headings", () => {
		expect(parseBlocks("## Hello")).toEqual([
			{ type: "heading", level: 2, text: "Hello" },
		]);
	});

	it("does not treat '#word' (no space) as a heading", () => {
		expect(parseBlocks("#word")).toEqual([
			{ type: "paragraph", text: "#word" },
		]);
	});

	it("joins consecutive quote lines into one block", () => {
		expect(parseBlocks("> a\n> b")).toEqual([
			{ type: "quote", lines: ["a", "b"] },
		]);
	});

	it("reads bullet and numbered lists", () => {
		expect(parseBlocks("- one\n* two\n3. three")).toEqual([
			{ type: "bullet", text: "one" },
			{ type: "bullet", text: "two" },
			{ type: "ordered", n: 3, text: "three" },
		]);
	});

	it("keeps code fences verbatim", () => {
		expect(parseBlocks("```\n**not bold**\nx\n```")).toEqual([
			{ type: "code", text: "**not bold**\nx" },
		]);
	});

	it("treats an unclosed fence as code until the end", () => {
		expect(parseBlocks("```\nabc")).toEqual([
			{ type: "code", text: "abc" },
		]);
	});

	it("collapses blank lines and drops trailing ones", () => {
		expect(parseBlocks("a\n\n\n\nb\n\n")).toEqual([
			{ type: "paragraph", text: "a" },
			{ type: "blank" },
			{ type: "paragraph", text: "b" },
		]);
	});

	it("understands Windows line endings", () => {
		expect(parseBlocks("a\r\nb")).toHaveLength(2);
	});

	it("returns nothing for empty text", () => {
		expect(parseBlocks("")).toEqual([]);
	});
});

describe("parseInline", () => {
	const text = (t: string) => ({ type: "text", text: t });

	it("leaves plain text alone", () => {
		expect(parseInline("hello")).toEqual([text("hello")]);
	});

	it("reads bold, italic, strike and code", () => {
		expect(parseInline("**b**")).toEqual([
			{ type: "bold", children: [text("b")] },
		]);
		expect(parseInline("*i*")).toEqual([
			{ type: "italic", children: [text("i")] },
		]);
		expect(parseInline("~~s~~")).toEqual([
			{ type: "strike", children: [text("s")] },
		]);
		expect(parseInline("`c`")).toEqual([{ type: "code", text: "c" }]);
	});

	it("reads bold italic", () => {
		expect(parseInline("***x***")).toEqual([
			{
				type: "bold",
				children: [{ type: "italic", children: [text("x")] }],
			},
		]);
	});

	it("keeps surrounding text", () => {
		expect(parseInline("a **b** c")).toEqual([
			text("a "),
			{ type: "bold", children: [text("b")] },
			text(" c"),
		]);
	});

	it("nests italic inside bold", () => {
		expect(parseInline("**a *b* c**")).toEqual([
			{
				type: "bold",
				children: [
					text("a "),
					{ type: "italic", children: [text("b")] },
					text(" c"),
				],
			},
		]);
	});

	it("does not format markers that float between spaces", () => {
		expect(parseInline("2 * 3 * 4")).toEqual([text("2 * 3 * 4")]);
	});

	it("does not format inside code", () => {
		expect(parseInline("`**x**`")).toEqual([
			{ type: "code", text: "**x**" },
		]);
	});
});
