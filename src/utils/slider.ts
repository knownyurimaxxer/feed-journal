/**
 * Which step (0..max) a touch lands on, for a slider `width` wide whose thumb
 * is `thumb` wide: the thumb's center runs from thumb/2 to width - thumb/2.
 */
export function stepFromTouch(
	x: number,
	width: number,
	thumb: number,
	max: number,
): number {
	if (width <= thumb || max <= 0) return 0;
	const f = (x - thumb / 2) / (width - thumb);
	return Math.round(Math.min(1, Math.max(0, f)) * max);
}
