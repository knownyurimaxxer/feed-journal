import { describe, expect, it } from "vitest";
import { stepFromTouch } from "../src/utils/slider";

describe("stepFromTouch", () => {
	// 300 wide, 30 thumb: the thumb's center travels from x=15 to x=285.
	it("maps the ends and the middle", () => {
		expect(stepFromTouch(15, 300, 30, 6)).toBe(0);
		expect(stepFromTouch(150, 300, 30, 6)).toBe(3);
		expect(stepFromTouch(285, 300, 30, 6)).toBe(6);
	});

	it("rounds to the nearest step", () => {
		expect(stepFromTouch(15 + 44, 300, 30, 6)).toBe(1); // 44 of 45 per step
		expect(stepFromTouch(15 + 20, 300, 30, 6)).toBe(0); // 20 of 45
		expect(stepFromTouch(15 + 25, 300, 30, 6)).toBe(1); // 25 of 45
	});

	it("clamps touches outside the track", () => {
		expect(stepFromTouch(-40, 300, 30, 6)).toBe(0);
		expect(stepFromTouch(999, 300, 30, 6)).toBe(6);
	});

	it("is safe before the slider has been measured", () => {
		expect(stepFromTouch(50, 0, 30, 6)).toBe(0);
		expect(stepFromTouch(50, 30, 30, 6)).toBe(0);
	});
});
