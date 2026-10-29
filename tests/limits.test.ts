import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, LIMITS } from "../src/constants";
import {
	clampLimit,
	fitToLimit,
	visibleLength,
} from "../src/utils/limits";

describe("clampLimit", () => {
	it("keeps numbers that are already allowed", () => {
		expect(clampLimit(280, 10, 5000, 280)).toBe(280);
		expect(clampLimit("42", 10, 5000, 280)).toBe(42);
	});

	it("snaps to the nearest allowed number", () => {
		expect(clampLimit(3, 10, 5000, 280)).toBe(10);
		expect(clampLimit(99999, 10, 5000, 280)).toBe(5000);
		expect(clampLimit("-5", 0, 30, 10)).toBe(0);
	});

	it("rounds to a whole number", () => {
		expect(clampLimit(12.6, 10, 5000, 280)).toBe(13);
	});

	it("allows 0 when the minimum is 0", () => {
		expect(clampLimit(0, 0, 30, 10)).toBe(0);
		expect(clampLimit("0", 0, 30, 10)).toBe(0);
	});

	it("falls back when there is no usable number", () => {
		expect(clampLimit("", 10, 5000, 280)).toBe(280);
		expect(clampLimit("  ", 10, 5000, 280)).toBe(280);
		expect(clampLimit("abc", 10, 5000, 280)).toBe(280);
		expect(clampLimit(null, 10, 5000, 280)).toBe(280);
		expect(clampLimit(undefined, 10, 5000, 280)).toBe(280);
		expect(clampLimit(NaN, 10, 5000, 280)).toBe(280);
		expect(clampLimit(Infinity, 10, 5000, 280)).toBe(280);
	});
});

describe("limit defaults", () => {
	it("sit inside their own allowed range", () => {
		for (const l of Object.values(LIMITS)) {
			expect(l.default >= l.min && l.default <= l.max).toBe(true);
		}
	});

	it("are what a fresh install starts with", () => {
		expect(DEFAULT_SETTINGS.maxChars).toBe(280);
		expect(DEFAULT_SETTINGS.maxTags).toBe(10);
	});
});

describe("visibleLength", () => {
	it("counts plain text, spaces and line breaks", () => {
		expect(visibleLength("")).toBe(0);
		expect(visibleLength("hello world")).toBe(11);
		expect(visibleLength("a\nb")).toBe(3);
	});

	it("does not count inline formatting marks", () => {
		expect(visibleLength("**bold**")).toBe(4);
		expect(visibleLength("*it*")).toBe(2);
		expect(visibleLength("~~gone~~")).toBe(4);
		expect(visibleLength("`code`")).toBe(4);
		expect(visibleLength("***both***")).toBe(4);
	});

	it("does not count a link's brackets or address", () => {
		expect(visibleLength("[docs](https://example.com/a/very/long/path)")).toBe(4);
		expect(visibleLength("see [a](https://a.com) now")).toBe(9);
		expect(visibleLength("**[b](http://b.org)**")).toBe(1);
		expect(visibleLength("[w](https://en.wikipedia.org/wiki/A_(b))")).toBe(1);
	});

	it("does not count heading, quote and list markers or code fences", () => {
		expect(visibleLength("## Title")).toBe(5);
		expect(visibleLength("> quote")).toBe(5);
		expect(visibleLength("- one\n- two")).toBe(7);
		expect(visibleLength("1. one")).toBe(3);
		expect(visibleLength("```\ncode\n```")).toBe(5); // "code" and its line break
	});

	it("counts what is shown as-is when it is not formatting", () => {
		expect(visibleLength("2 * 3 * 4")).toBe(9);
		expect(visibleLength("**")).toBe(2);
		expect(visibleLength("[x](javascript:alert(1))")).toBe(24);
		expect(visibleLength("[half](https://")).toBe(15);
	});

	it("does not count images, with or without Obsidian compatibility", () => {
		expect(visibleLength("a ![](https://example.com/very/long.png) b")).toBe(4);
		expect(visibleLength("a ![[long name.png]] b", { obsidian: true })).toBe(4);
		expect(visibleLength("a ![[long name.png]] b")).toBe(22);
	});

	it("does not count the checklist marker and box", () => {
		expect(visibleLength("- [ ] todo", { obsidian: true })).toBe(4);
		expect(visibleLength("- [x] todo", { obsidian: true })).toBe(4);
		expect(visibleLength("- [ ] todo")).toBe(8); // off: "[ ] todo" is plain text
	});

	it("counts emoji like the input does (UTF-16 units)", () => {
		expect(visibleLength("😀")).toBe("😀".length);
	});
});

describe("fitToLimit", () => {
	it("lets changes that fit go through", () => {
		expect(fitToLimit("abc", "abcd", 4)).toBe("abcd");
		expect(fitToLimit("abc", "ab", 4)).toBe("ab");
	});

	it("refuses one more character at the limit", () => {
		expect(fitToLimit("abcd", "abcde", 4)).toBe("abcd");
		expect(fitToLimit("abcd", "abXcd", 4)).toBe("abcd");
	});

	it("cuts a paste to what fits and leaves the rest alone", () => {
		expect(fitToLimit("ab", "ab12345", 5)).toBe("ab123");
		expect(fitToLimit("abXY", "ab123XY", 6)).toBe("ab12XY");
	});

	it("does not count formatting against the limit", () => {
		const post = "**abcd**";
		expect(visibleLength(post)).toBe(4);
		expect(fitToLimit(post, "**abcd**!", 4)).toBe(post);
		expect(fitToLimit("abcd", "[abcd](https://example.com/long)", 4)).toBe(
			"[abcd](https://example.com/long)",
		);
	});

	it("lets you finish formatting at the limit", () => {
		// "**ab" shows 4 characters; closing it hides the marks again.
		expect(fitToLimit("**ab*", "**ab**", 4)).toBe("**ab**");
	});

	it("allows deleting from a post that is already over the limit", () => {
		expect(fitToLimit("abcdef", "abcde", 3)).toBe("abcde");
		expect(fitToLimit("abcdef", "abcdeg", 3)).toBe("abcdeg");
	});

	it("never splits an emoji", () => {
		const out = fitToLimit("ab", "ab😀😀", 3);
		expect(out === "ab" || out === "ab😀").toBe(true);
		expect(out.length).toBeLessThanOrEqual(4);
	});
});

describe("fitToLimit with Obsidian compatibility", () => {
	it("lets you add a checklist box at the limit", () => {
		const opts = { obsidian: true };
		expect(fitToLimit("- [ ] ab", "- [x] ab", 2, opts)).toBe("- [x] ab");
		expect(fitToLimit("- [ ] ab", "- [ ] abc", 2, opts)).toBe("- [ ] ab");
	});
});
