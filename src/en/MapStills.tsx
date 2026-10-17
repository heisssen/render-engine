// Review sheet: every map beat of the episode as one frame, frozen at 80% of its animation.
import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';
import {BEATS} from './Main';
import {MapSpec, MapView} from './Map';
import {C, FONT} from './theme';

export const MAP_BEATS = BEATS.filter((r) => r.beat.k === 'map');

export const MapStills: React.FC = () => {
	const k = useCurrentFrame();
	const r = MAP_BEATS[k];
	if (!r) return null;
	return (
		<AbsoluteFill style={{background: C.night}}>
			<Freeze frame={Math.round(r.frames * 0.8)}>
				<MapView spec={r.beat as MapSpec} dur={r.frames} done={r.done} />
			</Freeze>
			<div style={{position: 'absolute', left: 50, bottom: 46, fontFamily: FONT.mono, fontSize: 26, color: C.paper, background: C.night, padding: '4px 12px'}}>beat {r.i}</div>
		</AbsoluteFill>
	);
};

// the eight control maps used for review
export const SAMPLE_BEATS = [3, 18, 28, 31, 43, 50, 51, 59];
const SAMPLES = SAMPLE_BEATS.map((i) => MAP_BEATS.find((r) => r.i === i)!).filter(Boolean);
// Freeze cannot go past the composition's end, so the compositions are as long as the longest map beat;
// render only frames 0..N-1 (one per map).
export const SAMPLES_LEN = Math.max(...SAMPLES.map((r) => r.frames)) + 2;
export const STILLS_LEN = Math.max(...MAP_BEATS.map((r) => r.frames)) + 2;
export const MapSamples: React.FC = () => {
	const r = SAMPLES[useCurrentFrame()];
	if (!r) return null;
	return (
		<AbsoluteFill style={{background: C.night}}>
			<Freeze frame={Math.round(r.frames * 0.75)}>
				<MapView spec={r.beat as MapSpec} dur={r.frames} done={r.done} />
			</Freeze>
		</AbsoluteFill>
	);
};
