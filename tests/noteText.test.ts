import { describe, expect, it } from "vitest";
import {
	cleanTitle,
	composeNote,
	fileNameFromTitle,
	isDefaultName,
	normalizeTag,
	parseNote,
	titleFromId,
	uniqueName,
} from "../src/utils/noteText";

describe("parseNote", () => {
	it("treats a file without front matter as plain body", () => {
		expect(parseNote("just text")).toEqual({
			body: "just text",
			tags: [],
			extra: [],
		});
	});

	it("reads tags written as [a, b]", () => {
		const r = parseNote("---\ntags: [one, two]\n---\nhello");
		expect(r.tags).toEqual(["one", "two"]);
		expect(r.body).toBe("hello");
	});

	it("reads tags written as a bare comma list", () => {
		expect(parseNote("---\ntags: one, two\n---\nhi").tags).toEqual([
			"one",
			"two",
		]);
	});

	it("reads tags written as a YAML list (Obsidian style)", () => {
		const r = parseNote("---\ntags:\n  - one\n  - Two Words\n---\nhi");
		expect(r.tags).toEqual(["one", "two-words"]);
	});

	it("removes duplicate tags", () => {
		expect(parseNote("---\ntags: [a, a, b]\n---\nx").tags).toEqual([
			"a",
			"b",
		]);
	});

	it("keeps other front matter lines untouched", () => {
		const r = parseNote(
			"---\naliases: foo\ntags: [a]\ncssclass: wide\n---\nx",
		);
		expect(r.extra).toEqual(["aliases: foo", "cssclass: wide"]);
		expect(r.tags).toEqual(["a"]);
	});

	it("accepts an empty front matter block", () => {
		expect(parseNote("---\n---\nhi")).toEqual({
			body: "hi",
			tags: [],
			extra: [],
		});
	});

	it("normalizes Windows line endings", () => {
		const r = parseNote("---\r\ntags: [a]\r\n---\r\nline1\r\nline2");
		expect(r.tags).toEqual(["a"]);
		expect(r.body).toBe("line1\nline2");
	});

	it("drops blank lines between the front matter and the body", () => {
		expect(parseNote("---\ntags: [a]\n---\n\n\nbody").body).toBe("body");
	});

	it("does not treat an unclosed --- as front matter", () => {
		const r = parseNote("---\nnot closed\nbody");
		expect(r.tags).toEqual([]);
		expect(r.body).toBe("---\nnot closed\nbody");
	});
});

describe("composeNote", () => {
	it("writes only the body when there is nothing else", () => {
		expect(composeNote("hello", [])).toBe("hello");
	});

	it("writes tags as front matter", () => {
		expect(composeNote("hello", ["a", "b"])).toBe(
			"---\ntags: [a, b]\n---\nhello",
		);
	});

	it("keeps extra lines even when there are no tags", () => {
		expect(composeNote("hi", [], ["aliases: x"])).toBe(
			"---\naliases: x\n---\nhi",
		);
	});

	it("round-trips through parseNote", () => {
		const text = composeNote("one\n\ntwo", ["x", "y"], ["aliases: z"]);
		expect(parseNote(text)).toEqual({
			body: "one\n\ntwo",
			tags: ["x", "y"],
			extra: ["aliases: z"],
		});
	});
});

describe("note names", () => {
	it("recognises the default date/time names", () => {
		expect(isDefaultName("2026-10-28_14-03-22_ab12")).toBe(true);
		expect(isDefaultName("2026-10-28_14-03-22")).toBe(true);
		expect(isDefaultName("My trip")).toBe(false);
		expect(isDefaultName("2026-10-28 notes")).toBe(false);
	});

	it("only returns a title for named notes", () => {
		expect(titleFromId("2026-10-28_14-03-22_ab12")).toBeNull();
		expect(titleFromId("Groceries")).toBe("Groceries");
	});

	it("cleans titles", () => {
		expect(cleanTitle("  a   b \n c ")).toBe("a b c");
	});

	it("builds safe file names", () => {
		expect(fileNameFromTitle("Hello world")).toBe("Hello world");
		expect(fileNameFromTitle('a/b\\c:d*e?f"g<h>i|j')).toBe("abcdefghij");
		expect(fileNameFromTitle("...hidden")).toBe("hidden");
		expect(fileNameFromTitle("ends with dots.. ")).toBe("ends with dots");
		expect(fileNameFromTitle("???")).toBeNull();
		expect(fileNameFromTitle("   ")).toBeNull();
		expect(fileNameFromTitle("x".repeat(200))).toHaveLength(80);
	});

	it("finds a free name, ignoring case", () => {
		expect(uniqueName("Idea", new Set())).toBe("Idea");
		expect(uniqueName("Idea", new Set(["idea"]))).toBe("Idea (2)");
		expect(uniqueName("Idea", new Set(["idea", "idea (2)"]))).toBe(
			"Idea (3)",
		);
	});
});

describe("normalizeTag", () => {
	it("lowercases, strips # and turns spaces into dashes", () => {
		expect(normalizeTag("#Hello World")).toBe("hello-world");
	});

	it("removes commas", () => {
		expect(normalizeTag("a,b,")).toBe("ab");
	});

	it("cuts to the max length", () => {
		expect(normalizeTag("abcdefghij", 4)).toBe("abcd");
	});

	it("returns an empty string when nothing is left", () => {
		expect(normalizeTag("  ## ")).toBe("");
	});
});
