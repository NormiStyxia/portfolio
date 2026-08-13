import { useEffect, useRef, useState } from 'react';

const STABILITY_DELAY = 110;
const CURRENT_SECTION_BONUS = 0.065;

function scoreSection(element) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

  if (visibleHeight <= 0) return -1;

  const visibleRatio = visibleHeight / Math.max(1, Math.min(rect.height, viewportHeight));
  const centerDistance = Math.abs((rect.top + rect.bottom) / 2 - viewportHeight / 2);
  const centerScore = 1 - Math.min(1, centerDistance / viewportHeight);
  return visibleRatio * 0.72 + centerScore * 0.28;
}

export function useActivePortfolioSection(sectionTargets) {
  const initialSection = sectionTargets[0]?.context || 'hero';
  const [currentSection, setCurrentSection] = useState(initialSection);
  const currentSectionRef = useRef(initialSection);

  useEffect(() => {
    const targets = sectionTargets
      .map((target) => ({ ...target, element: document.getElementById(target.id) }))
      .filter((target) => target.element);

    if (!targets.length) return undefined;

    let scheduledFrame;
    let stabilityTimer;
    let pendingContext = null;
    let pendingSince = 0;

    const commit = (context) => {
      pendingContext = null;
      pendingSince = 0;
      currentSectionRef.current = context;
      setCurrentSection((previous) => (previous === context ? previous : context));
    };

    const evaluate = () => {
      scheduledFrame = undefined;
      const scoredTargets = targets.map((target) => {
        const baseScore = scoreSection(target.element);
        return {
          ...target,
          score: baseScore < 0 ? baseScore : baseScore + (target.scoreBoost || 0),
        };
      });
      const visibleTargets = scoredTargets.filter(({ score }) => score >= 0);
      if (!visibleTargets.length) return;

      let bestTarget = visibleTargets.reduce((best, target) => (
        target.score > best.score ? target : best
      ));
      const currentTarget = visibleTargets.find(({ context }) => context === currentSectionRef.current);

      if (
        currentTarget
        && bestTarget.context !== currentTarget.context
        && bestTarget.score < currentTarget.score + CURRENT_SECTION_BONUS
      ) {
        bestTarget = currentTarget;
      }

      if (bestTarget.context === currentSectionRef.current) {
        pendingContext = null;
        pendingSince = 0;
        if (stabilityTimer !== undefined) {
          window.clearTimeout(stabilityTimer);
          stabilityTimer = undefined;
        }
        return;
      }

      const now = performance.now();
      if (pendingContext !== bestTarget.context) {
        pendingContext = bestTarget.context;
        pendingSince = now;
      }

      const remaining = STABILITY_DELAY - (now - pendingSince);
      if (remaining <= 0) {
        commit(bestTarget.context);
        return;
      }

      if (stabilityTimer !== undefined) window.clearTimeout(stabilityTimer);
      stabilityTimer = window.setTimeout(evaluate, remaining);
    };

    const scheduleEvaluate = () => {
      if (scheduledFrame === undefined) scheduledFrame = window.requestAnimationFrame(evaluate);
    };

    const observer = new IntersectionObserver(scheduleEvaluate, {
      threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1],
    });

    targets.forEach((target) => observer.observe(target.element));
    window.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', scheduleEvaluate);
    evaluate();

    return () => {
      if (scheduledFrame !== undefined) window.cancelAnimationFrame(scheduledFrame);
      if (stabilityTimer !== undefined) window.clearTimeout(stabilityTimer);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleEvaluate);
      window.removeEventListener('resize', scheduleEvaluate);
    };
  }, [sectionTargets]);

  return currentSection;
}
