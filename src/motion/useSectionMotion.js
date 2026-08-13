import { useLayoutEffect, useState } from 'react';

export function useSectionMotion(sectionId, activeSection, { enabled = true } = {}) {
  const isActive = enabled && activeSection === sectionId;
  const [revealed, setRevealed] = useState(false);
  const [epoch, setEpoch] = useState(0);

  useLayoutEffect(() => {
    if (!isActive) return undefined;

    setRevealed(false);
    let revealFrame;
    const resetFrame = window.requestAnimationFrame(() => {
      revealFrame = window.requestAnimationFrame(() => {
        setEpoch((current) => current + 1);
        setRevealed(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(resetFrame);
      if (revealFrame !== undefined) window.cancelAnimationFrame(revealFrame);
    };
  }, [isActive]);

  return { epoch, isActive, revealed };
}
