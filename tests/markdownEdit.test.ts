import { describe, expect, it } from "vitest";
import {
	toggleCodeBlock,
	toggleImage,
	toggleLinePrefix,
	toggleLink,
	toggleTaskAtTap,
	toggleTaskLine,
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

describe("toggleLinePrefix: task", () => {
	it("turns a line into an unchecked checklist item, and back", () => {
		const on = toggleLinePrefix("buy milk", sel(3), "task");
		expect(on.text).toBe("- [ ] buy milk");
		expect(toggleLinePrefix(on.text, on.selection, "task").text).toBe("buy milk");
	});

	it("replaces a bullet or number instead of stacking prefixes", () => {
		expect(toggleLinePrefix("- milk", sel(0), "task").text).toBe("- [ ] milk");
		expect(toggleLinePrefix("2. milk", sel(0), "task").text).toBe("- [ ] milk");
	});

	it("keeps the box of items that already are checklist items", () => {
		expect(toggleLinePrefix("- [x] a\nb", sel(0, 9), "task").text).toBe(
			"- [x] a\n- [ ] b",
		);
	});

	it("removes the whole checklist prefix when switching to another list kind", () => {
		expect(toggleLinePrefix("- [x] a", sel(0), "quote").text).toBe("> a");
		expect(toggleLinePrefix("- [ ] a", sel(0), "bullet").text).toBe("a");
		expect(toggleLinePrefix("- [ ] a", sel(0), "ordered").text).toBe("1. a");
	});
});

describe("toggleTaskLine", () => {
	it("flips the box of the given line", () => {
		expect(toggleTaskLine("a\n- [ ] b\n- [x] c", 1)).toBe("a\n- [x] b\n- [x] c");
		expect(toggleTaskLine("a\n- [ ] b\n- [x] c", 2)).toBe("a\n- [ ] b\n- [ ] c");
		expect(toggleTaskLine("- [X] b", 0)).toBe("- [ ] b");
	});

	it("leaves everything else alone", () => {
		const text = "a\n- b\n```\n- [ ] code\n```";
		for (const line of [-1, 0, 1, 3, 99]) expect(toggleTaskLine(text, line)).toBe(text);
	});

	it("keeps Windows line endings", () => {
		expect(toggleTaskLine("- [ ] a\r\n- [ ] b", 1)).toBe("- [ ] a\r\n- [x] b");
	});
});

describe("toggleTaskAtTap", () => {
	const text = "intro\n- [ ] one\n- [x] two";
	// "intro\n" is 6 characters: line 1 ("- [ ] one") spans 6-14, its "[" is at 8, "]" at 10,
	// and its newline at 15. Line 2 starts at 16, so its "[" is at 18 and "]" at 20.
	it("ticks a box when the cursor jumps into it", () => {
		const r = toggleTaskAtTap(text, sel(0), sel(9));
		expect(r?.text).toBe("intro\n- [x] one\n- [x] two");
		expect(r?.selection).toEqual(sel(15)); // end of that line
		expect(toggleTaskAtTap(text, sel(0), sel(10))?.text).toContain("- [x] one");
	});

	it("unticks a checked box", () => {
		expect(toggleTaskAtTap(text, sel(0), sel(19))?.text).toBe(
			"intro\n- [ ] one\n- [ ] two",
		);
	});

	it("ignores moving one character at a time (typing, arrow keys)", () => {
		expect(toggleTaskAtTap(text, sel(8), sel(9))).toBeNull();
		expect(toggleTaskAtTap(text, sel(10), sel(9))).toBeNull();
	});

	it("ignores a cursor outside the box", () => {
		for (const at of [3, 6, 7, 8, 11, 12, 15, 16, 18, 21])
			expect(toggleTaskAtTap(text, sel(0), sel(at))).toBeNull();
	});

	it("ignores a selection and plain lines", () => {
		expect(toggleTaskAtTap(text, sel(0), sel(9, 12))).toBeNull();
		expect(toggleTaskAtTap("- [ ] a\n- b", sel(0), sel(10))).toBeNull();
	});

	it("does not tick boxes inside a code block", () => {
		expect(toggleTaskAtTap("```\n- [ ] a\n```", sel(0), sel(8))).toBeNull();
	});

	it("counts a selection that was collapsed by the tap as a jump", () => {
		expect(toggleTaskAtTap(text, sel(8, 9), sel(9))?.text).toContain("- [x] one");
	});
});

describe("toggleImage", () => {
	it("inserts a template with the address selected", () => {
		const r = toggleImage("ab", sel(1));
		expect(r.text).toBe("a![](https://)b");
		expect(r.text.slice(r.selection.start, r.selection.end)).toBe("https://");
	});

	it("uses the selected text as the description", () => {
		const r = toggleImage("my cat", sel(3, 6));
		expect(r.text).toBe("my ![cat](https://)");
		expect(r.text.slice(r.selection.start, r.selection.end)).toBe("https://");
	});

	it("turns a selected address into the image", () => {
		const r = toggleImage("see https://a.com/i.png", sel(4, 23));
		expect(r.text).toBe("see ![](https://a.com/i.png)");
		expect(r.selection).toEqual(sel(6));
	});

	it("removes an image the cursor is in, keeping its description", () => {
		const text = "x ![cat](https://a.com/c.png) y";
		const r = toggleImage(text, sel(8));
		expect(r.text).toBe("x cat y");
		expect(r.selection).toEqual(sel(2, 5));
	});

	it("leaves a selection across lines alone", () => {
		expect(toggleImage("a\nb", sel(0, 3)).text).toBe("a\nb");
	});
});

describe("toggleLink next to images", () => {
	it("does not strip the link part of an image", () => {
		const text = "![cat](https://a.com/c.png)";
		expect(toggleLink(text, sel(4)).text).not.toBe("!cat");
	});
});
