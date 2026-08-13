const assetRoot = `${import.meta.env.BASE_URL}assets/portfolio/companion`;

const framePaths = (folder, frameCount) => Array.from(
  { length: frameCount },
  (_, index) => `${assetRoot}/${folder}/frame_${String(index + 1).padStart(2, '0')}.png`,
);

export const companionClips = {
  idle: {
    frames: framePaths('idle', 16),
    fps: 10,
    loop: true,
    frameWidth: 256,
    frameHeight: 512,
    footAnchor: { x: 123, y: 512 },
  },
  blink: {
    frames: framePaths('blink', 16),
    fps: 10,
    loop: false,
    frameWidth: 256,
    frameHeight: 512,
    footAnchor: { x: 123, y: 512 },
  },
  move: {
    frames: framePaths('move', 16),
    fps: 16,
    loop: true,
    frameWidth: 256,
    frameHeight: 512,
    footAnchor: { x: 128, y: 501 },
  },
  drag: {
    frames: framePaths('drag', 16),
    fps: 16,
    loop: true,
    frameWidth: 360,
    frameHeight: 512,
    footAnchor: { x: 208, y: 512 },
    semanticAnchors: {
      dragGrab: { x: 241.65925925925927, y: 87.22962962962963 },
    },
    sourceFacing: 'left',
  },
  tapReactA: {
    frames: framePaths('tap_react_a', 16),
    fps: 16,
    loop: false,
    frameWidth: 280,
    frameHeight: 512,
    footAnchor: { x: 134, y: 512 },
  },
  tapReactB: {
    frames: framePaths('tap_react_b', 16),
    fps: 16,
    loop: false,
    frameWidth: 304,
    frameHeight: 512,
    footAnchor: { x: 142, y: 512 },
  },
};

export function preloadCompanionClip(clipName) {
  const clip = companionClips[clipName];
  if (!clip || typeof Image === 'undefined') return;

  clip.frames.forEach((src) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
}
