import { useEffect, useRef, useState } from 'react';
import { bootstrapPortfolio } from './preloadAssets.js';
import './PortfolioLoader.css';

const MINIMUM_VISIBLE_MS = 650;
const READY_HOLD_MS = 200;
const EXIT_MS = 480;

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function PortfolioLoader({ heroImage, firstMedia, onReveal, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading');
  const runRef = useRef(null);

  useEffect(() => {
    let active = true;
    const startedAt = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.portfolioBooting = 'true';

    if (!runRef.current) {
      runRef.current = bootstrapPortfolio({
        heroImage,
        firstMedia,
        onProgress: (nextProgress) => setProgress(nextProgress),
      });
    }

    const finishBootstrap = async () => {
      const outcome = await runRef.current;
      const remainingMinimum = Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - startedAt));
      await wait(remainingMinimum);
      if (!active) return;

      setProgress(1);
      setPhase('ready');
      onReveal?.(outcome);
      await wait(reducedMotion ? 80 : READY_HOLD_MS);
      if (!active) return;

      setPhase('exiting');
      await wait(reducedMotion ? 140 : EXIT_MS);
      if (!active) return;

      delete document.documentElement.dataset.portfolioBooting;
      onComplete?.(outcome);
    };

    finishBootstrap();
    return () => {
      active = false;
      delete document.documentElement.dataset.portfolioBooting;
    };
  }, [firstMedia, heroImage, onComplete, onReveal]);

  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const isReady = phase !== 'loading';

  return (
    <div
      className="portfolio-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={isReady ? '作品集准备完成' : `作品集正在加载，${percentage}%`}
    >
      <div className="portfolio-loader__inner">
        <div className="portfolio-loader__content">
          <div className="portfolio-loader__mark" aria-hidden="true">NS</div>
          <p className="portfolio-loader__meta">Portfolio / 2026</p>
          <p className="portfolio-loader__status">
            {isReady ? 'Ready / 100' : `Loading ${String(percentage).padStart(2, '0')}`}
          </p>
          <div className="portfolio-loader__rule" aria-hidden="true">
            <span style={{ '--loader-progress': progress }} />
          </div>
        </div>
      </div>
    </div>
  );
}
