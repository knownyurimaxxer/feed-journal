/**
 * Turns whatever came out of a text box or the database into a usable limit:
 * a whole number between `min` and `max`. Anything that isn't a number
 * (empty, text, null) gives `fallback`.
 */
export function clampLimit(
	value: unknown,
	min: number,
	max: number,
	fallback: number,
): number {
	let n: number;
	if (typeof value === "number") n = value;
	else if (typeof value === "string" && value.trim() !== "")
		n = Number(value);
	else return fallback;
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, Math.round(n)));
}
