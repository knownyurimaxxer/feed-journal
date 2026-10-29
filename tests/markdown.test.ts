import { describe, expect, it } from "vitest";
import {
	looksLikeUrl,
	parseBlocks,
	parseInline,
	safeHref,
} from "../src/utils/markdown";

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

describe("links", () => {
	it("parses [text](url)", () => {
		expect(parseInline("see [docs](https://a.com/x) now")).toEqual([
			{ type: "text", text: "see " },
			{
				type: "link",
				href: "https://a.com/x",
				children: [{ type: "text", text: "docs" }],
			},
			{ type: "text", text: " now" },
		]);
	});

	it("allows formatting inside the link text", () => {
		const [link] = parseInline("[**hi**](https://a.com)");
		expect(link).toEqual({
			type: "link",
			href: "https://a.com",
			children: [
				{ type: "bold", children: [{ type: "text", text: "hi" }] },
			],
		});
	});

	it("allows a link inside bold", () => {
		const [bold] = parseInline("**see [a](https://a.com)**");
		expect(bold.type).toBe("bold");
	});

	it("keeps one level of parentheses in the url", () => {
		const [link] = parseInline("[w](https://en.wikipedia.org/wiki/A_(b))");
		expect(link).toMatchObject({
			type: "link",
			href: "https://en.wikipedia.org/wiki/A_(b)",
		});
	});

	it("does not link addresses it will not open", () => {
		expect(parseInline("[x](javascript:alert(1))")).toEqual([
			{ type: "text", text: "[x](javascript:alert(1))" },
		]);
		expect(parseInline("[x](https://)")).toEqual([
			{ type: "text", text: "[x](https://)" },
		]);
	});

	it("leaves lone brackets alone", () => {
		expect(parseInline("[not a link] (nope)")).toEqual([
			{ type: "text", text: "[not a link] (nope)" },
		]);
	});
});

describe("safeHref", () => {
	it("accepts http, https and mailto", () => {
		expect(safeHref("https://a.com")).toBe("https://a.com");
		expect(safeHref("HTTP://a.com")).toBe("HTTP://a.com");
		expect(safeHref("mailto:me@a.com")).toBe("mailto:me@a.com");
	});

	it("adds https:// to bare addresses", () => {
		expect(safeHref("example.com")).toBe("https://example.com");
		expect(safeHref("www.example.com/a?b=1")).toBe(
			"https://www.example.com/a?b=1",
		);
		expect(safeHref("example.com:8080/x")).toBe(
			"https://example.com:8080/x",
		);
	});

	it("rejects everything else", () => {
		for (const bad of [
			"javascript:alert(1)",
			"data:text/html,hi",
			"file:///etc/passwd",
			"intent://x",
			"hello",
			"https://",
			"a b.com",
			"",
		])
			expect(safeHref(bad)).toBeNull();
	});
});

describe("looksLikeUrl", () => {
	it("is true only for clear addresses", () => {
		expect(looksLikeUrl("https://a.com")).toBe(true);
		expect(looksLikeUrl("www.a.com")).toBe(true);
		expect(looksLikeUrl("mailto:a@b.c")).toBe(true);
		expect(looksLikeUrl("e.g")).toBe(false);
		expect(looksLikeUrl("hello world")).toBe(false);
	});
});
