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
  takeoverRaise: {
    frames: framePaths('takeover_raise', 15),
    fps: 12,
    loop: false,
    frameWidth: 360,
    frameHeight: 512,
    footAnchor: { x: 235, y: 512 },
  },
  takeoverLoop: {
    frames: framePaths('takeover_loop', 16),
    fps: 16,
    loop: true,
    frameWidth: 360,
    frameHeight: 512,
    footAnchor: { x: 235.85185185185185, y: 512 },
  },
  takeoverFinish: {
    frames: framePaths('takeover_finish', 16),
    fps: 16,
    loop: false,
    frameWidth: 360,
    frameHeight: 512,
    footAnchor: { x: 234, y: 512 },
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

const clipPreloadCache = new Map();
const clipImageCache = new Map();

export function preloadCompanionClip(clipName) {
  const clip = companionClips[clipName];
  if (!clip || typeof Image === 'undefined') return Promise.resolve();
  if (clipPreloadCache.has(clipName)) return clipPreloadCache.get(clipName);

  const images = clip.frames.map((src) => {
    const image = new Image();
    image.decoding = 'async';
    return { image, src };
  });
  clipImageCache.set(clipName, images.map(({ image }) => image));

  const preload = Promise.all(images.map(({ image, src }) => new Promise((resolve) => {
    const finish = () => resolve();
    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
    image.src = src;
  })));

  clipPreloadCache.set(clipName, preload);
  return preload;
}
