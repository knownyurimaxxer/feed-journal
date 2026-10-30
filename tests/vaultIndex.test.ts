import { describe, expect, it } from "vitest";
import {
	addToIndex,
	createIndex,
	findInIndex,
	isObsidianActive,
} from "../src/utils/vaultIndex";

function vault(...paths: string[]) {
	const index = createIndex();
	for (const p of paths) addToIndex(index, p, `file:///vault/${p}`);
	return index;
}

describe("findInIndex", () => {
	const index = vault(
		"cover.png",
		"Attachments/photo.png",
		"Attachments/trips/Rome.JPG",
		"Old/Attachments/photo.png",
		"deep/a/b/c/map.webp",
	);

	it("finds a file by name only, wherever it is", () => {
		expect(findInIndex(index, "Rome.jpg")).toBe(
			"file:///vault/Attachments/trips/Rome.JPG",
		);
		expect(findInIndex(index, "map.webp")).toBe(
			"file:///vault/deep/a/b/c/map.webp",
		);
	});

	it("ignores case", () => {
		expect(findInIndex(index, "COVER.PNG")).toBe("file:///vault/cover.png");
	});

	it("prefers the file closest to the top when names repeat", () => {
		expect(findInIndex(index, "photo.png")).toBe(
			"file:///vault/Attachments/photo.png",
		);
	});

	it("finds a file by its path from the vault folder", () => {
		expect(findInIndex(index, "Old/Attachments/photo.png")).toBe(
			"file:///vault/Old/Attachments/photo.png",
		);
	});

	it("accepts just the end of a path", () => {
		expect(findInIndex(index, "trips/rome.jpg")).toBe(
			"file:///vault/Attachments/trips/Rome.JPG",
		);
		expect(findInIndex(index, "b/c/map.webp")).toBe(
			"file:///vault/deep/a/b/c/map.webp",
		);
	});

	it("does not fall back to the name when a folder was written and is wrong", () => {
		expect(findInIndex(index, "Nope/photo.png")).toBeNull();
	});

	it("tolerates ./, leading / and backslashes", () => {
		expect(findInIndex(index, "./cover.png")).toBe(
			"file:///vault/cover.png",
		);
		expect(findInIndex(index, "/Attachments/photo.png")).toBe(
			"file:///vault/Attachments/photo.png",
		);
		expect(findInIndex(index, "Attachments\\photo.png")).toBe(
			"file:///vault/Attachments/photo.png",
		);
	});

	it("returns null for missing or empty references", () => {
		expect(findInIndex(index, "missing.png")).toBeNull();
		expect(findInIndex(index, "")).toBeNull();
		expect(findInIndex(createIndex(), "cover.png")).toBeNull();
	});
});

describe("isObsidianActive", () => {
	it("needs both the setting and a vault folder", () => {
		expect(isObsidianActive(true, "content://vault")).toBe(true);
		expect(isObsidianActive(true, null)).toBe(false);
		expect(isObsidianActive(false, "content://vault")).toBe(false);
		expect(isObsidianActive(false, null)).toBe(false);
	});
});
