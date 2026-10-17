// Motion system (source of truth: docs/bibles/motion-system.md).
// Things arrive like a lever thrown: fast start, firm stop, no bounce. One idea moves at a time.
import {Easing, interpolate} from 'remotion';

export const DUR = {micro: 6, short: 10, base: 16, long: 24, stagger: 3, hold: 45} as const;
export const CURVE = {
	in: Easing.bezier(0.16, 1, 0.3, 1), // arrive
	out: Easing.bezier(0.7, 0, 0.84, 0), // leave
	move: Easing.bezier(0.65, 0, 0.35, 1), // travel across the frame
	draw: Easing.bezier(0.33, 0, 0.2, 1), // lines drawing
} as const;
export const DIST = {rise: 36, slide: 40, drop: 50, window: 260} as const;

const c = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 -> 1 as an element arrives at frame `at` */
export const arrive = (f: number, at = 0, len: number = DUR.base) => interpolate(f, [at, at + len], [0, 1], {...c, easing: CURVE.in});
/** 1 -> 0 as an element leaves, finishing at frame `end` */
export const leave = (f: number, end: number, len: number = DUR.short) => 1 - interpolate(f, [end - len, end], [0, 1], {...c, easing: CURVE.out});
/** 0 -> 1 for a line drawing on */
export const draw = (f: number, at = 0, len: number = DUR.long) => interpolate(f, [at, at + len], [0, 1], {...c, easing: CURVE.draw});
/** 0 -> 1 for something travelling across the frame */
export const travel = (f: number, at = 0, len: number = DUR.short) => interpolate(f, [at, at + len], [0, 1], {...c, easing: CURVE.move});

/** rule first, text second: progress of the red rail rule and of the text it introduces */
export const ruleThenText = (f: number, at = 0) => ({rule: draw(f, at, DUR.base), text: arrive(f, at + DUR.micro, DUR.base)});
