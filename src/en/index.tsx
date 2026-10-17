import React from 'react';
import {Composition, Still, registerRoot} from 'remotion';
import {Avatar, Banner, Watermark} from './ChannelArt';
import {IDENT_FRAMES, Ident} from './Ident';
import {Main} from './Main';
import {EPISODE} from './story';
import {MapSamples, MapStills, SAMPLES_LEN, STILLS_LEN} from './MapStills';
import {ThumbA, ThumbB, ThumbB2, ThumbB3, ThumbB4, ThumbC, ThumbD, ThumbE, ThumbF, ThumbG} from './Thumbs';
import timings from './timings.json';

const Root: React.FC = () => (
	<>
		<Composition id="MainEN" component={Main} width={1920} height={1080} fps={30} durationInFrames={timings.total} />
		<Composition id="IdentPreview" component={() => <Ident title={EPISODE.title} data={EPISODE.ident} />} width={1920} height={1080} fps={30} durationInFrames={IDENT_FRAMES} />
		<Composition id="MapStills" component={MapStills} width={1920} height={1080} fps={1} durationInFrames={STILLS_LEN} />
		<Composition id="MapSamples" component={MapSamples} width={1920} height={1080} fps={1} durationInFrames={SAMPLES_LEN} />
		<Still id="Avatar" component={Avatar} width={800} height={800} />
		<Still id="Banner" component={Banner} width={2560} height={1440} />
		<Still id="ThumbA" component={ThumbA} width={1280} height={720} />
		<Still id="ThumbB" component={ThumbB} width={1280} height={720} />
		<Still id="ThumbC" component={ThumbC} width={1280} height={720} />
		<Still id="ThumbB2" component={ThumbB2} width={1280} height={720} />
		<Still id="ThumbB3" component={ThumbB3} width={1280} height={720} />
		<Still id="ThumbB4" component={ThumbB4} width={1280} height={720} />
		<Still id="ThumbD" component={ThumbD} width={1280} height={720} />
		<Still id="ThumbE" component={ThumbE} width={1280} height={720} />
		<Still id="ThumbF" component={ThumbF} width={1280} height={720} />
		<Still id="ThumbG" component={ThumbG} width={1280} height={720} />
		<Still id="Watermark" component={Watermark} width={150} height={150} />
	</>
);

registerRoot(Root);
