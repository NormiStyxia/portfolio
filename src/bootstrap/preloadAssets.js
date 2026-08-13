import { companionClips, preloadCompanionClip } from '../companion/companionAssets.js';

const FAIL_OPEN_MS = 12000;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

function decodeImage(src) {
  if (!src) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.addEventListener('load', async () => {
      try {
        await image.decode();
      } catch {
        // A loaded image can still be displayed when explicit decoding is unavailable.
      }
      resolve(image);
    }, { once: true });
    image.addEventListener('error', () => reject(new Error(`Image failed: ${src}`)), { once: true });
    image.src = src;
  });
}

function loadVideoMetadata(media) {
  if (!media?.src) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const finish = (callback) => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('error', handleError);
      callback();
    };
    const handleMetadata = () => finish(() => resolve(video));
    const handleError = () => finish(() => reject(new Error(`Video metadata failed: ${media.src}`)));

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    if (media.poster) video.poster = media.poster;
    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    video.addEventListener('error', handleError, { once: true });
    video.src = media.src;
    video.load();
  });
}

async function loadPortfolioFonts() {
  if (!document.fonts) return;

  await Promise.allSettled([
    document.fonts.load('400 1rem "LeMi MuHe Yuan"', '游戏设计与视觉工作流'),
    document.fonts.load('400 4rem "Chill HuoSong"', '诺米作品集'),
    document.fonts.load('400 0.75rem "Sarasa Mono SC"', 'PORTFOLIO 2026'),
    document.fonts.load('700 0.75rem "Sarasa Mono SC"', 'PROJECT 01'),
  ]);
  await document.fonts.ready;
}

async function prepareCompanionRuntime(assetPromises) {
  await Promise.allSettled(assetPromises);
  const requiredClips = Object.keys(companionClips);
  const invalidClip = requiredClips.find((name) => !companionClips[name]?.frames?.length);
  if (invalidClip) throw new Error(`Companion clip unavailable: ${invalidClip}`);
  await nextFrame();
}

async function waitForStableLayout(dependencies) {
  await Promise.allSettled(dependencies);
  await nextFrame();
  await nextFrame();

  const hero = document.getElementById('hero');
  const selectedWorks = document.getElementById('selected-works');
  if (!hero?.getBoundingClientRect().height || !selectedWorks?.getBoundingClientRect().height) {
    throw new Error('Portfolio layout is not measurable');
  }
}

/**
 * Resolve the real first-paint dependencies without making any single resource
 * a permanent blocker. Progress advances only when a bootstrap checkpoint settles.
 */
export async function bootstrapPortfolio({ heroImage, firstMedia, onProgress }) {
  const fontsReady = loadPortfolioFonts();
  const heroAssetsReady = decodeImage(heroImage);
  const companionClipReady = Object.fromEntries(
    Object.keys(companionClips).map((clipName) => [clipName, preloadCompanionClip(clipName)]),
  );
  const companionRuntimeReady = prepareCompanionRuntime(Object.values(companionClipReady));
  const firstPosterReady = decodeImage(firstMedia?.poster);
  const firstMediaReady = loadVideoMetadata(firstMedia);
  const layoutReady = waitForStableLayout([
    fontsReady,
    heroAssetsReady,
    firstPosterReady,
    firstMediaReady,
  ]);

  const checkpoints = [
    ['fontsReady', fontsReady],
    ['heroAssetsReady', heroAssetsReady],
    ...Object.entries(companionClipReady).map(([clipName, promise]) => [
      `companion:${clipName}`,
      promise,
    ]),
    ['companionRuntimeReady', companionRuntimeReady],
    ['firstPosterReady', firstPosterReady],
    ['firstMediaReady', firstMediaReady],
    ['layoutReady', layoutReady],
  ];

  let completed = 0;
  let bootFinished = false;
  const results = {};
  onProgress?.(0, results);

  const tracked = checkpoints.map(async ([name, promise]) => {
    try {
      await promise;
      results[name] = 'fulfilled';
    } catch {
      results[name] = 'rejected';
    } finally {
      completed += 1;
      if (!bootFinished) onProgress?.(completed / checkpoints.length, { ...results });
    }
  });

  let timeoutId;
  const allSettled = Promise.allSettled(tracked).then(() => ({ timedOut: false }));
  const failOpen = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => resolve({ timedOut: true }), FAIL_OPEN_MS);
  });
  const outcome = await Promise.race([allSettled, failOpen]);

  bootFinished = true;
  window.clearTimeout(timeoutId);
  return { ...outcome, checkpoints: { ...results } };
}
