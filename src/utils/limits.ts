import { liveSpans } from "./liveStyle";

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

/**
 * How many characters of a post count toward the limit: only what you can
 * read. Markdown syntax is free: the *, **, ~~ and ` around text, the "[" and
 * "](url)" of a link (the address included), heading #s, list and quote
 * markers and code fences. Line breaks and everything else count.
 * It is derived from the same pieces the editor draws, so the count always
 * agrees with what the post shows.
 */
export function visibleLength(md: string): number {
	let n = 0;
	for (const span of liveSpans(md, null))
		if (!span.hidden && !span.marker) n += span.text.length;
	return n;
}

/**
 * Applies a change of the text box (`prev` -> `next`) under a limit on the
 * visible length. A change that stays within the limit, or does not make the
 * post longer, goes through as is. Otherwise the part that was just typed or
 * pasted is shortened until it fits (typing one more character at the limit
 * gives back `prev`), so the rest of the post is never touched.
 */
export function fitToLimit(prev: string, next: string, limit: number): string {
	const allowed = Math.max(limit, visibleLength(prev));
	if (visibleLength(next) <= allowed) return next;

	// What was inserted is what lies between the common start and common end.
	let a = 0;
	while (a < prev.length && a < next.length && prev[a] === next[a]) a++;
	let b = 0;
	while (
		b < prev.length - a &&
		b < next.length - a &&
		prev[prev.length - 1 - b] === next[next.length - 1 - b]
	)
		b++;
	const head = next.slice(0, a);
	const tail = next.slice(next.length - b);
	const added = next.slice(a, next.length - b);

	// Longest start of the inserted text that fits. (Not a binary search: finishing
	// a "**bold**" makes the post shorter again, so length is not steady.)
	for (let n = added.length - 1; n >= 0; n--) {
		const code = added.charCodeAt(n - 1);
		if (n > 0 && code >= 0xd800 && code <= 0xdbff) continue; // never split an emoji
		const candidate = head + added.slice(0, n) + tail;
		if (visibleLength(candidate) <= allowed) return candidate;
	}
	return prev;
}
