import { describe, expect, it } from "vitest";
import {
	toggleCodeBlock,
	toggleLinePrefix,
	toggleLink,
	toggleWrap,
} from "../src/utils/markdownEdit";

const sel = (start: number, end = start) => ({ start, end });

describe("toggleWrap", () => {
	it("wraps the selection", () => {
		expect(toggleWrap("say hi now", sel(4, 6), "**")).toEqual({
			text: "say **hi** now",
			selection: sel(6, 8),
		});
	});

	it("unwraps when the markers sit just outside the selection", () => {
		expect(toggleWrap("say **hi** now", sel(6, 8), "**")).toEqual({
			text: "say hi now",
			selection: sel(4, 6),
		});
	});

	it("unwraps when the markers are inside the selection", () => {
		expect(toggleWrap("say **hi** now", sel(4, 10), "**")).toEqual({
			text: "say hi now",
			selection: sel(4, 6),
		});
	});

	it("inserts an empty pair and puts the cursor inside", () => {
		expect(toggleWrap("ab", sel(1), "~~")).toEqual({
			text: "a~~~~b",
			selection: sel(3),
		});
	});

	it("accepts a backwards selection", () => {
		expect(toggleWrap("hi", sel(2, 0), "*").text).toBe("*hi*");
	});

	it("adds italic on top of bold, and removes only the italic", () => {
		const both = toggleWrap("**hi**", sel(2, 4), "*");
		expect(both.text).toBe("***hi***");
		expect(toggleWrap(both.text, both.selection, "*").text).toBe("**hi**");
	});
});

describe("toggleCodeBlock", () => {
	it("fences the selection on its own lines", () => {
		const r = toggleCodeBlock("a b c", sel(2, 3));
		expect(r.text).toBe("a \n```\nb\n```\n c");
		expect(r.text.slice(r.selection.start, r.selection.end)).toBe("b");
	});

	it("removes the fences again", () => {
		const on = toggleCodeBlock("code", sel(0, 4));
		expect(on.text).toBe("```\ncode\n```");
		expect(toggleCodeBlock(on.text, on.selection).text).toBe("code");
	});
});

describe("toggleLinePrefix", () => {
	it("adds and removes a bullet", () => {
		const on = toggleLinePrefix("item", sel(0), "bullet");
		expect(on.text).toBe("- item");
		expect(toggleLinePrefix(on.text, on.selection, "bullet").text).toBe(
			"item",
		);
	});

	it("numbers several lines and skips blank ones", () => {
		expect(toggleLinePrefix("a\n\nb", sel(0, 4), "ordered").text).toBe(
			"1. a\n\n2. b",
		);
	});

	it("only touches the lines the selection reaches", () => {
		expect(toggleLinePrefix("a\nb\nc", sel(2), "quote").text).toBe(
			"a\n> b\nc",
		);
	});

	it("switches one list type for another instead of stacking", () => {
		expect(toggleLinePrefix("- a", sel(0), "ordered").text).toBe("1. a");
	});

	it("cycles headings: none -> ## -> ### -> none", () => {
		const h2 = toggleLinePrefix("title", sel(0), "heading");
		expect(h2.text).toBe("## title");
		const h3 = toggleLinePrefix(h2.text, h2.selection, "heading");
		expect(h3.text).toBe("### title");
		expect(toggleLinePrefix(h3.text, h3.selection, "heading").text).toBe(
			"title",
		);
	});

	it("works on an empty text", () => {
		expect(toggleLinePrefix("", sel(0), "bullet").text).toBe("- ");
	});
});

describe("toggleLink", () => {
	it("inserts a template with the label selected when nothing is selected", () => {
		const r = toggleLink("ab", sel(1));
		expect(r.text).toBe("a[link text](https://)b");
		expect(r.text.slice(r.selection.start, r.selection.end)).toBe(
			"link text",
		);
	});

	it("turns selected text into the label and selects the address placeholder", () => {
		const r = toggleLink("see docs here", sel(4, 8));
		expect(r.text).toBe("see [docs](https://) here");
		expect(r.text.slice(r.selection.start, r.selection.end)).toBe(
			"https://",
		);
	});

	it("turns a selected address into the target, cursor in the label", () => {
		const r = toggleLink("go www.a.com now", sel(3, 12));
		expect(r.text).toBe("go [](www.a.com) now");
		expect(r.selection).toEqual(sel(4));
	});

	it("removes an existing link and keeps its text", () => {
		const r = toggleLink("x [hi](https://a.com) y", sel(4));
		expect(r.text).toBe("x hi y");
		expect(r.selection).toEqual(sel(2, 4));
	});

	it("removes the link when the whole link is selected", () => {
		const text = "[hi](https://a.com)";
		expect(toggleLink(text, sel(0, text.length)).text).toBe("hi");
	});

	it("treats a cursor right after the link as outside it", () => {
		const text = "[hi](https://a.com)";
		expect(toggleLink(text, sel(text.length)).text).toBe(
			text + "[link text](https://)",
		);
	});

	it("does not touch a selection across lines", () => {
		expect(toggleLink("a\nb", sel(0, 3))).toEqual({
			text: "a\nb",
			selection: sel(0, 3),
		});
	});

	it("only looks at the cursor's own line", () => {
		const r = toggleLink("[a](https://a.com)\nplain", sel(21));
		expect(r.text).toBe("[a](https://a.com)\npl[link text](https://)ain");
	});
});
