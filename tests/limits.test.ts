import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, LIMITS } from "../src/constants";
import { clampLimit } from "../src/utils/limits";

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
