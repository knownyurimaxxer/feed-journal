import { describe, expect, it } from "vitest";
import {
	collectImages,
	imageRef,
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

describe("checklists (Obsidian compatibility)", () => {
	const on = { obsidian: true };

	it("reads - [ ] and - [x] lines, with their line number", () => {
		expect(parseBlocks("intro\n- [ ] one\n- [x] two\n- [X] three", on)).toEqual([
			{ type: "paragraph", text: "intro" },
			{ type: "task", checked: false, text: "one", line: 1 },
			{ type: "task", checked: true, text: "two", line: 2 },
			{ type: "task", checked: true, text: "three", line: 3 },
		]);
	});

	it("counts the lines of earlier blocks, blank lines and code fences", () => {
		const blocks = parseBlocks("a\n\n```\n- [ ] not a task\n```\n- [ ] yes", on);
		const tasks = blocks.filter((b) => b.type === "task");
		expect(tasks).toEqual([{ type: "task", checked: false, text: "yes", line: 5 }]);
	});

	it("allows an empty item and other list markers", () => {
		expect(parseBlocks("* [ ]", on)).toEqual([
			{ type: "task", checked: false, text: "", line: 0 },
		]);
	});

	it("needs a space after the box", () => {
		expect(parseBlocks("- [ ]nope", on)).toEqual([
			{ type: "bullet", text: "[ ]nope" },
		]);
		expect(parseBlocks("- [y] nope", on)[0].type).toBe("bullet");
	});

	it("is plain bullets when Obsidian compatibility is off", () => {
		expect(parseBlocks("- [ ] one")).toEqual([
			{ type: "bullet", text: "[ ] one" },
		]);
	});
});

describe("images", () => {
	const on = { obsidian: true };
	const web = (url: string) => ({ kind: "web", url });
	const vault = (path: string) => ({ kind: "vault", path });

	it("reads ![alt](https://...) with or without Obsidian compatibility", () => {
		for (const opts of [{}, on]) {
			expect(parseInline("![a cat](https://a.com/cat.png)", opts)).toEqual([
				{ type: "image", image: web("https://a.com/cat.png"), alt: "a cat" },
			]);
		}
	});

	it("accepts an empty description and keeps text around the picture", () => {
		expect(parseInline("see ![](http://a.com/x) now")).toEqual([
			{ type: "text", text: "see " },
			{ type: "image", image: web("http://a.com/x"), alt: "" },
			{ type: "text", text: " now" },
		]);
	});

	it("reads sizes: ![alt|300](url) and ![alt|300x200](url)", () => {
		expect(parseInline("![cat|300](https://a.com/c.png)")).toEqual([
			{ type: "image", image: web("https://a.com/c.png"), alt: "cat", width: 300 },
		]);
		expect(parseInline("![|300x200](https://a.com/c.png)")).toEqual([
			{
				type: "image",
				image: web("https://a.com/c.png"),
				alt: "",
				width: 300,
				height: 200,
			},
		]);
	});

	it("reads ![[file.png]] embeds only with Obsidian compatibility", () => {
		expect(parseInline("![[My Photo.png]]", on)).toEqual([
			{ type: "image", image: vault("My Photo.png"), alt: "" },
		]);
		expect(parseInline("![[My Photo.png]]")).toEqual([
			{ type: "text", text: "![[My Photo.png]]" },
		]);
	});

	it("reads embed sizes and descriptions", () => {
		expect(parseInline("![[a.png|250]]", on)).toEqual([
			{ type: "image", image: vault("a.png"), alt: "", width: 250 },
		]);
		expect(parseInline("![[a.png|a sunset|250x100]]", on)).toEqual([
			{
				type: "image",
				image: vault("a.png"),
				alt: "a sunset",
				width: 250,
				height: 100,
			},
		]);
		expect(parseInline("![[a.png|a sunset]]", on)).toEqual([
			{ type: "image", image: vault("a.png"), alt: "a sunset" },
		]);
	});

	it("keeps folders in embeds and drops #anchors", () => {
		expect(parseInline("![[Attachments/a b.png#x]]", on)).toEqual([
			{ type: "image", image: vault("Attachments/a b.png"), alt: "" },
		]);
	});

	it("looks up vault paths written the Markdown way, only with Obsidian compatibility", () => {
		expect(parseInline("![](Attachments/my%20photo.jpg)", on)).toEqual([
			{ type: "image", image: vault("Attachments/my photo.jpg"), alt: "" },
		]);
		expect(parseInline("![](Attachments/photo.jpg)")).toEqual([
			{ type: "text", text: "![](Attachments/photo.jpg)" },
		]);
	});

	it("does not draw things that are not pictures", () => {
		for (const bad of [
			"![[Some note]]",
			"![[doc.pdf]]",
			"![](javascript:alert(1))",
			"![](file:///etc/passwd)",
			"![](https://)",
		])
			expect(parseInline(bad, on)).toEqual([{ type: "text", text: bad }]);
		// A bare address is not a web address (it would be a vault path, if Obsidian is on).
		expect(parseInline("![](example.com/a.png)")).toEqual([
			{ type: "text", text: "![](example.com/a.png)" },
		]);
	});

	it("is not confused with links", () => {
		const [link, , img] = parseInline("[a](https://a.com) ![b](https://b.com/i.png)");
		expect(link.type).toBe("link");
		expect(img.type).toBe("image");
	});

	it("can sit inside bold", () => {
		const [bold] = parseInline("**![](https://a.com/i.png)**");
		expect(bold.type).toBe("bold");
	});

	it("is found by collectImages, in order, skipping code", () => {
		const md = "![](https://a.com/1.png) text\n```\n![](https://a.com/x.png)\n```\n- ![[2.png]]\n> ![](https://a.com/3.png)";
		expect(collectImages(md, on).map((i) => i.image)).toEqual([
			web("https://a.com/1.png"),
			vault("2.png"),
			web("https://a.com/3.png"),
		]);
		expect(collectImages(md).map((i) => i.image)).toEqual([
			web("https://a.com/1.png"),
			web("https://a.com/3.png"),
		]);
	});
});

describe("imageRef", () => {
	it("accepts http and https addresses", () => {
		expect(imageRef("https://a.com/x", false)).toEqual({ kind: "web", url: "https://a.com/x" });
		expect(imageRef("HTTP://a.com/x.png", true)).toEqual({ kind: "web", url: "HTTP://a.com/x.png" });
	});

	it("cleans vault paths", () => {
		expect(imageRef("./a\\b.png", true)).toEqual({ kind: "vault", path: "a/b.png" });
		expect(imageRef("/a.PNG", true)).toEqual({ kind: "vault", path: "a.PNG" });
		expect(imageRef("100%.png", true)).toEqual({ kind: "vault", path: "100%.png" });
	});

	it("rejects other file types and empty names", () => {
		expect(imageRef("a.svg", true)).toBeNull();
		expect(imageRef("#x", true)).toBeNull();
		expect(imageRef("", true)).toBeNull();
	});
});
