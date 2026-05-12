import { Composition } from 'remotion';
import { HarnessVideo, TOTAL_DURATION } from './HarnessVideo';

export const RemotionRoot = () => (
  <Composition
    id="HarnessVideo"
    component={HarnessVideo}
    durationInFrames={TOTAL_DURATION}
    fps={30}
    width={1280}
    height={720}
  />
);
