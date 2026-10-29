import { describe, expect, it } from "vitest";
import { PRESETS } from "../src/constants";
import {
	contrastRatio,
	folderLabel,
	linkColor,
	newNoteId,
	parseIdDate,
	readableOn,
	timeAgo,
} from "../src/utils/format";
import { isDefaultName } from "../src/utils/noteText";

describe("readableOn", () => {
	it("picks white on dark colors and black on light ones", () => {
		expect(readableOn("#000000")).toBe("#FFFFFF");
		expect(readableOn("#001935")).toBe("#FFFFFF");
		expect(readableOn("#FFFFFF")).toBe("#000000");
		expect(readableOn("#F2EFE9")).toBe("#000000");
	});

	it("keeps the text of every preset readable on its card", () => {
		for (const t of Object.values(PRESETS)) {
			const cardIsLight = readableOn(t.card) === "#000000";
			const textIsLight = readableOn(t.text) === "#000000";
			expect(textIsLight).toBe(!cardIsLight);
		}
	});
});

describe("timeAgo", () => {
	const ago = (ms: number) => timeAgo(Date.now() - ms);

	it("uses short labels", () => {
		expect(ago(5_000)).toBe("just now");
		expect(ago(5 * 60_000 + 500)).toBe("5m");
		expect(ago(3 * 3_600_000 + 500)).toBe("3h");
		expect(ago(2 * 86_400_000 + 500)).toBe("2d");
	});

	it("falls back to a date after a week", () => {
		const old = Date.now() - 30 * 86_400_000;
		expect(timeAgo(old)).toBe(new Date(old).toLocaleDateString());
	});

	it("does not break on timestamps from the future", () => {
		expect(timeAgo(Date.now() + 60_000)).toBe("just now");
	});
});

describe("note ids", () => {
	it("builds the date/time name the app expects", () => {
		const d = new Date(2026, 9, 28, 14, 3, 22);
		const id = newNoteId(d);
		expect(id.startsWith("2026-10-28_14-03-22_")).toBe(true);
		expect(isDefaultName(id)).toBe(true);
	});

	it("can be turned back into the same moment", () => {
		const d = new Date(2026, 0, 5, 7, 8, 9);
		expect(parseIdDate(newNoteId(d))).toBe(d.getTime());
	});

	it("does not parse names that are not dates", () => {
		expect(parseIdDate("Groceries")).toBeNull();
	});

	it("gives different names to notes made in the same second", () => {
		const d = new Date(2026, 0, 1);
		const ids = new Set(Array.from({ length: 50 }, () => newNoteId(d)));
		expect(ids.size).toBeGreaterThan(40);
	});
});

describe("folderLabel", () => {
	it("labels the default storage", () => {
		expect(folderLabel(null)).toBe("App storage (default)");
	});

	it("shows the last part of an Android folder URI", () => {
		expect(
			folderLabel(
				"content://com.android.externalstorage.documents/tree/primary%3ADocuments%2FNotes",
			),
		).toBe("Notes");
	});

	it("survives a broken URI", () => {
		expect(folderLabel("content://x/%E0%A4%A")).toBe(
			"content://x/%E0%A4%A",
		);
	});
});

describe("contrastRatio / linkColor", () => {
	it("measures the WCAG contrast ratio", () => {
		expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
		expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
		expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
	});

	it("uses the accent when it stands out, the text color when it is too faint", () => {
		const base = PRESETS[Object.keys(PRESETS)[0]];
		expect(
			linkColor({ ...base, accent: "#000000", card: "#FFFFFF" }),
		).toBe("#000000");
		expect(
			linkColor({
				...base,
				accent: "#EEEEEE",
				card: "#FFFFFF",
				text: "#111111",
			}),
		).toBe("#111111");
	});

	it("gives every preset a link color that is readable on its card", () => {
		for (const t of Object.values(PRESETS))
			expect(contrastRatio(linkColor(t), t.card)).toBeGreaterThanOrEqual(3);
	});
});
