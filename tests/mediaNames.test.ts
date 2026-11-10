import { describe, expect, it } from "vitest";
import {
	embedFor,
	folderSegments,
	formatElapsed,
	insertEmbed,
	mediaFileName,
	mediaStamp,
	normalizeFolder,
} from "../src/utils/mediaNames";
import { liveSpans } from "../src/utils/liveStyle";
import { visibleLength } from "../src/utils/limits";

describe("mediaStamp", () => {
	it("is the full date and time with no separators", () => {
		expect(mediaStamp(new Date(2026, 10, 7, 12, 55, 55))).toBe(
			"20261107125555",
		);
	});
	it("pads single digits", () => {
		expect(mediaStamp(new Date(2026, 0, 2, 3, 4, 5))).toBe(
			"20260102030405",
		);
	});
});

describe("folderSegments", () => {
	it("splits on / and \\ and drops empty parts", () => {
		expect(folderSegments("/Attachments\\\\Audio//")).toEqual([
			"Attachments",
			"Audio",
		]);
	});
	it("never allows going up or forbidden characters", () => {
		expect(folderSegments("../a/./b:c?")).toEqual(["a", "bc"]);
	});
	it("empty means the vault folder itself", () => {
		expect(folderSegments("  ")).toEqual([]);
		expect(normalizeFolder("a//b/")).toBe("a/b");
	});
});

describe("mediaFileName", () => {
	it("uses the stamp", () => {
		expect(mediaFileName("20261107125555", "webp", () => false)).toBe(
			"20261107125555.webp",
		);
	});
	it("adds a number when the name is taken", () => {
		const taken = new Set(["20261107125555.m4a", "20261107125555-2.m4a"]);
		expect(
			mediaFileName("20261107125555", ".M4A", (n) => taken.has(n)),
		).toBe("20261107125555-3.m4a");
	});
});

describe("insertEmbed", () => {
	const e = embedFor("A/b.webp");
	it("goes on its own line and the cursor moves below it", () => {
		const r = insertEmbed("hello", { start: 5, end: 5 }, e);
		expect(r.text).toBe("hello\n![[A/b.webp]]\n");
		expect(r.selection.start).toBe(r.text.length);
	});
	it("in an empty note", () => {
		expect(insertEmbed("", { start: 0, end: 0 }, e).text).toBe(
			"![[A/b.webp]]\n",
		);
	});
	it("in the middle of a line", () => {
		expect(insertEmbed("ab cd", { start: 2, end: 2 }, e).text).toBe(
			"ab\n![[A/b.webp]]\n cd",
		);
	});
	it("does not double the line breaks", () => {
		expect(insertEmbed("a\nb", { start: 1, end: 1 }, e).text).toBe(
			"a\n![[A/b.webp]]\nb",
		);
	});
});

describe("formatElapsed", () => {
	it("shows minutes and seconds", () => {
		expect(formatElapsed(125_000)).toBe("2:05");
		expect(formatElapsed(0)).toBe("0:00");
	});
});

describe("voice note and video embeds", () => {
	const opts = { obsidian: true };
	it("stay visible and are free of the character count", () => {
		const text = "hi ![[Attachments/Audio/20261107125555.m4a]]";
		expect(visibleLength(text, opts)).toBe(3);
		expect(
			liveSpans(text, null, opts).some((s) => s.image && s.marker),
		).toBe(true);
	});
	it("count as text with Obsidian off", () => {
		const text = "![[a.mp4]]";
		expect(visibleLength(text, {})).toBe(text.length);
	});
});

import { collectMedia, parseInline } from "../src/utils/markdown";
import { pickAllowed } from "../src/utils/limits";

describe("playable embeds", () => {
	const on = { obsidian: true };
	it("a voice note becomes a media node", () => {
		expect(
			parseInline("![[Attachments/Audio/20261107125555.m4a]]", on),
		).toEqual([
			{
				type: "media",
				kind: "audio",
				path: "Attachments/Audio/20261107125555.m4a",
			},
		]);
	});
	it("a video is told apart from a voice note", () => {
		expect(collectMedia("a\n\n![[v/20261107125555.mp4]]", on)).toEqual([
			{ type: "media", kind: "video", path: "v/20261107125555.mp4" },
		]);
	});
	it("stays text with Obsidian off", () => {
		expect(parseInline("![[a.m4a]]", {})).toEqual([
			{ type: "text", text: "![[a.m4a]]" },
		]);
	});
});

describe("pickAllowed", () => {
	it("keeps a valid choice and replaces anything else", () => {
		expect(pickAllowed(64, [32, 64], 32)).toBe(64);
		expect(pickAllowed(65, [32, 64], 32)).toBe(32);
		expect(pickAllowed(undefined, ["h264", "hevc"] as const, "h264")).toBe(
			"h264",
		);
	});
});
