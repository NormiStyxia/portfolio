import { useCallback, useEffect, useRef, useState } from 'react';

const DESKTOP_CONFIG = {
  safeMargin: 18,
  characterHalfWidth: 110,
  minWalkDistance: 72,
  maxWalkDistance: 320,
  moveSpeed: 64,
};

const MOBILE_CONFIG = {
  safeMargin: 10,
  characterHalfWidth: 58,
  minWalkDistance: 16,
  maxWalkDistance: 48,
  moveSpeed: 46,
  minimumFraction: 0.8,
};

const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function getMotionConfig() {
  return window.innerWidth < 768 ? MOBILE_CONFIG : DESKTOP_CONFIG;
}

function getBounds(config = getMotionConfig()) {
  const minimum = Math.max(
    config.safeMargin + config.characterHalfWidth,
    window.innerWidth * (config.minimumFraction || 0),
  );
  const maximum = Math.max(minimum, window.innerWidth - config.safeMargin - config.characterHalfWidth);
  return { minimum, maximum };
}

function getDropBounds(config = getMotionConfig()) {
  return {
    minimum: config.safeMargin + config.characterHalfWidth,
    maximum: Math.max(
      config.safeMargin + config.characterHalfWidth,
      window.innerWidth - config.safeMargin - config.characterHalfWidth,
    ),
  };
}

function getInitialPosition() {
  const fraction = window.innerWidth < 768 ? 0.88 : 0.28;
  const bounds = getBounds();
  return clamp(window.innerWidth * fraction, bounds.minimum, bounds.maximum);
}

function chooseWalkTarget(machine) {
  const config = getMotionConfig();
  const bounds = getBounds(config);
  const leftDistance = Math.max(0, machine.x - bounds.minimum);
  const rightDistance = Math.max(0, bounds.maximum - machine.x);
  const canWalkLeft = leftDistance >= config.minWalkDistance;
  const canWalkRight = rightDistance >= config.minWalkDistance;

  if (!canWalkLeft && !canWalkRight) return null;

  let direction;
  let available;

  if (canWalkLeft && canWalkRight) {
    const total = leftDistance + rightDistance;
    direction = Math.random() * total < leftDistance ? -1 : 1;
    available = direction < 0 ? leftDistance : rightDistance;
  } else {
    direction = canWalkLeft ? -1 : 1;
    available = canWalkLeft ? leftDistance : rightDistance;
  }

  const roll = Math.random();
  let maximumDistance;

  if (roll < 0.25) {
    maximumDistance = Math.min(available, Math.max(config.minWalkDistance, config.maxWalkDistance * 0.45));
  } else if (roll < 0.8) {
    maximumDistance = Math.min(available, Math.max(config.minWalkDistance, config.maxWalkDistance));
  } else {
    maximumDistance = available;
  }

  const distance = randomBetween(config.minWalkDistance, maximumDistance);
  return clamp(machine.x + direction * distance, bounds.minimum, bounds.maximum);
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  ));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

export function useCompanionMovement({ paused, reducedMotion }) {
  const [snapshot, setSnapshot] = useState(() => ({
    x: typeof window === 'undefined' ? 0 : getInitialPosition(),
    mode: 'idle',
    facing: 'left',
  }));
  const machineRef = useRef({
    x: snapshot.x,
    mode: 'idle',
    facing: 'left',
    targetX: null,
    arrivalPending: false,
    arrivalHoldRemaining: 0,
    idleRemaining: randomBetween(2.6, 5.6),
    correctingBounds: false,
  });
  const pausedRef = useRef(paused);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      const machine = machineRef.current;
      machine.mode = 'idle';
      machine.targetX = null;
      machine.arrivalPending = false;
      machine.arrivalHoldRemaining = 0;
      machine.correctingBounds = false;
      machine.idleRemaining = randomBetween(2.6, 5.6);
      setSnapshot({ x: machine.x ?? 0, mode: 'idle', facing: machine.facing });
    }
  }, [paused]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    if (reducedMotion) {
      const machine = machineRef.current;
      machine.mode = 'idle';
      machine.targetX = null;
      machine.arrivalPending = false;
      machine.arrivalHoldRemaining = 0;
      machine.correctingBounds = false;
      setSnapshot({ x: machine.x ?? 0, mode: 'idle', facing: machine.facing });
    }
  }, [reducedMotion]);

  useEffect(() => {
    const machine = machineRef.current;
    const initialBounds = getBounds();

    machine.x = clamp(machine.x, initialBounds.minimum, initialBounds.maximum);

    let animationFrame;
    let previousTime = performance.now();

    const publish = () => {
      setSnapshot((previous) => {
        if (
          Math.abs(previous.x - machine.x) < 0.1
          && previous.mode === machine.mode
          && previous.facing === machine.facing
        ) {
          return previous;
        }
        return { x: machine.x, mode: machine.mode, facing: machine.facing };
      });
    };

    const startIdle = () => {
      machine.mode = 'idle';
      machine.targetX = null;
      machine.arrivalPending = false;
      machine.arrivalHoldRemaining = 0;
      machine.correctingBounds = false;
      machine.idleRemaining = randomBetween(2.6, 5.6);
    };

    const startWalk = (targetX, correctingBounds = false) => {
      if (targetX === null || Math.abs(targetX - machine.x) < 1.5) {
        startIdle();
        return;
      }
      machine.targetX = targetX;
      machine.arrivalPending = false;
      machine.arrivalHoldRemaining = 0;
      machine.facing = targetX > machine.x ? 'right' : 'left';
      machine.mode = 'walk';
      machine.correctingBounds = correctingBounds;
    };

    const update = (time) => {
      const deltaTime = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
      previousTime = time;

      if (machine.mode === 'walk' && machine.targetX !== null) {
        const config = getMotionConfig();
        const delta = machine.targetX - machine.x;
        const distance = Math.abs(delta);

        if (machine.arrivalPending) {
          machine.arrivalHoldRemaining -= deltaTime;
          if (machine.arrivalHoldRemaining <= 0) startIdle();
        } else {
          const direction = delta > 0 ? 1 : -1;
          const speed = machine.correctingBounds ? Math.max(96, config.moveSpeed) : config.moveSpeed;
          const step = Math.min(distance, speed * deltaTime);
          machine.x += direction * step;
          if (step >= distance) {
            machine.arrivalPending = true;
            machine.arrivalHoldRemaining = 0.08;
          }
        }
      } else if (machine.mode !== 'drag' && !pausedRef.current && !reducedMotionRef.current) {
        machine.idleRemaining -= deltaTime;
        if (machine.idleRemaining <= 0) startWalk(chooseWalkTarget(machine));
      }

      publish();
      animationFrame = requestAnimationFrame(update);
    };

    const handleResize = () => {
      const bounds = getBounds();
      if (machine.mode === 'drag') {
        publish();
        return;
      }
      if (machine.x < bounds.minimum || machine.x > bounds.maximum) {
        startWalk(clamp(machine.x, bounds.minimum, bounds.maximum), true);
      } else if (machine.targetX !== null) {
        machine.targetX = clamp(machine.targetX, bounds.minimum, bounds.maximum);
      }
    };

    window.addEventListener('resize', handleResize);
    animationFrame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const beginDrag = useCallback(() => {
    const machine = machineRef.current;
    machine.mode = 'drag';
    machine.targetX = null;
    machine.arrivalPending = false;
    machine.arrivalHoldRemaining = 0;
    machine.correctingBounds = false;
    setSnapshot({ x: machine.x, mode: 'drag', facing: machine.facing });
  }, []);

  const dragTo = useCallback((x) => {
    const machine = machineRef.current;
    machine.x = x;
    machine.mode = 'drag';
    machine.targetX = null;
    machine.arrivalPending = false;
    machine.arrivalHoldRemaining = 0;
    setSnapshot({ x: machine.x, mode: 'drag', facing: machine.facing });
  }, []);

  const endDrag = useCallback(() => {
    const machine = machineRef.current;
    const bounds = getDropBounds();
    machine.x = clamp(machine.x, bounds.minimum, bounds.maximum);
    machine.mode = 'idle';
    machine.targetX = null;
    machine.arrivalPending = false;
    machine.arrivalHoldRemaining = 0;
    machine.correctingBounds = false;
    machine.idleRemaining = randomBetween(2.6, 5.6);
    setSnapshot({ x: machine.x, mode: 'idle', facing: machine.facing });
  }, []);

  return { ...snapshot, beginDrag, dragTo, endDrag };
}

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
  const [currentSection, setCurrentSection] = useState(sectionTargets[0]?.context || 'hero');

  useEffect(() => {
    const targets = sectionTargets
      .map((target) => ({ ...target, element: document.getElementById(target.id) }))
      .filter((target) => target.element);

    if (!targets.length) return undefined;

    let scheduledFrame;
    const evaluate = () => {
      scheduledFrame = undefined;
      let bestTarget = targets[0];
      let bestScore = -1;

      targets.forEach((target) => {
        const score = scoreSection(target.element);
        if (score > bestScore) {
          bestScore = score;
          bestTarget = target;
        }
      });

      if (bestScore >= 0) setCurrentSection((previous) => (
        previous === bestTarget.context ? previous : bestTarget.context
      ));
    };

    const scheduleEvaluate = () => {
      if (scheduledFrame === undefined) scheduledFrame = requestAnimationFrame(evaluate);
    };

    const observer = new IntersectionObserver(scheduleEvaluate, {
      threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1],
    });

    targets.forEach((target) => observer.observe(target.element));
    window.addEventListener('scroll', scheduleEvaluate, { passive: true });
    window.addEventListener('resize', scheduleEvaluate);
    evaluate();

    return () => {
      if (scheduledFrame !== undefined) cancelAnimationFrame(scheduledFrame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleEvaluate);
      window.removeEventListener('resize', scheduleEvaluate);
    };
  }, [sectionTargets]);

  return currentSection;
}
