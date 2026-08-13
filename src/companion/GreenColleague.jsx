import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { companionClips, preloadCompanionClip } from './companionAssets.js';
import { companionIntroDialogue, getCompanionDialogue } from './companionDialogue.js';
import {
  useActivePortfolioSection,
  useCompanionMovement,
  useReducedMotion,
} from './companionState.js';
import './GreenColleague.css';

const reactionClips = ['tapReactA', 'tapReactB'];
const INTRO_STORAGE_KEY = 'companionIntroSeen';
const INTRO_IDLE = 'intro-idle';
const INTRO_DIALOGUE = 'intro-dialogue';
const INTRO_COMPLETE = 'complete';
const TAKEOVER_RAISE = 'takeoverRaise';
const TAKEOVER_LOOP = 'takeoverLoop';
const TAKEOVER_FINISH = 'takeoverFinish';

const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
const clipDuration = (clipName) => (
  (companionClips[clipName].frames.length / companionClips[clipName].fps) * 1000
);

function hasSeenCompanionIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberCompanionIntro() {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
  } catch {
    // The companion still works when storage is unavailable.
  }
}

function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewportWidth;
}

function useCompanionAnimation({ movementMode, dialogueOpen, reducedMotion, ambientClipName }) {
  const [reactionClip, setReactionClip] = useState(null);
  const [blinkClip, setBlinkClip] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const reactionRequestRef = useRef(0);
  const baseClip = movementMode === 'drag' ? 'drag' : movementMode === 'walk' ? 'move' : 'idle';
  const activeClipName = movementMode === 'idle'
    ? reactionClip || ambientClipName || (blinkClip ? 'blink' : baseClip)
    : baseClip;
  const activeClip = companionClips[activeClipName];

  useEffect(() => {
    if (movementMode === 'idle') return;
    reactionRequestRef.current += 1;
    setBlinkClip(false);
    setReactionClip(null);
  }, [movementMode]);

  useEffect(() => {
    preloadCompanionClip('idle');
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 350));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = schedule(() => {
      preloadCompanionClip('move');
      preloadCompanionClip('blink');
    });
    return () => cancel(handle);
  }, []);

  useEffect(() => {
    setFrameIndex(0);
    if (reducedMotion && !reactionClip) return undefined;

    const interval = window.setInterval(() => {
      setFrameIndex((previous) => {
        const next = previous + 1;
        if (next < activeClip.frames.length) return next;
        if (activeClip.loop) return 0;

        window.setTimeout(() => {
          if (reactionClip) setReactionClip(null);
          if (blinkClip) setBlinkClip(false);
        }, 0);
        return activeClip.frames.length - 1;
      });
    }, 1000 / activeClip.fps);

    return () => window.clearInterval(interval);
  }, [activeClip, blinkClip, reactionClip, reducedMotion]);

  useEffect(() => {
    if (
      movementMode !== 'idle'
      || dialogueOpen
      || reducedMotion
      || ambientClipName
      || reactionClip
      || blinkClip
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => setBlinkClip(true), 1800 + Math.random() * 2700);
    return () => window.clearTimeout(timer);
  }, [ambientClipName, blinkClip, dialogueOpen, movementMode, reactionClip, reducedMotion]);

  const playTapReaction = () => {
    const clipName = reactionClips[Math.floor(Math.random() * reactionClips.length)];
    const requestId = reactionRequestRef.current + 1;
    reactionRequestRef.current = requestId;
    setBlinkClip(false);
    preloadCompanionClip(clipName).then(() => {
      if (reactionRequestRef.current === requestId) setReactionClip(clipName);
    });
  };

  return {
    clip: activeClip,
    clipName: activeClipName,
    frameSrc: activeClip.frames[Math.min(frameIndex, activeClip.frames.length - 1)],
    playTapReaction,
  };
}

function DialogueBubble({ dialogue, projectAnchors, onNavigate, onClose, style }) {
  const [lineIndex, setLineIndex] = useState(0);
  const isLastLine = lineIndex === dialogue.lines.length - 1;

  useEffect(() => {
    setLineIndex(0);
  }, [dialogue]);

  return (
    <section
      className="green-colleague__bubble"
      aria-label="绿毛同事说"
      aria-live="polite"
      style={style}
    >
      <button className="green-colleague__close" type="button" onClick={onClose} aria-label="关闭绿毛同事对话">
        ×
      </button>
      <div className="green-colleague__lines">
        <p key={`${dialogue.id || 'dialogue'}-${lineIndex}`}>{dialogue.lines[lineIndex]}</p>
      </div>
      {!isLastLine ? (
        <button
          className="green-colleague__continue"
          type="button"
          onClick={() => setLineIndex((current) => current + 1)}
        >
          <span className="green-colleague__continue-count">{lineIndex + 1} / {dialogue.lines.length}</span>
          <span>下一句 <span className="green-colleague__continue-icon" aria-hidden="true">→</span></span>
        </button>
      ) : null}
      {dialogue.showProjectNavigation && isLastLine ? (
        <nav className="green-colleague__choices" aria-label="选择项目">
          {projectAnchors.map((project) => (
            <button key={project.id} type="button" onClick={() => onNavigate(project.id)}>
              <span>{project.label}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </nav>
      ) : null}
      <span className="green-colleague__tail" aria-hidden="true" />
    </section>
  );
}

export function GreenColleague({ sectionTargets, projectAnchors }) {
  const rootRef = useRef(null);
  const characterRef = useRef(null);
  const introInitiallySeenRef = useRef(null);
  if (introInitiallySeenRef.current === null) {
    introInitiallySeenRef.current = hasSeenCompanionIntro();
  }
  const seenCountRef = useRef(introInitiallySeenRef.current ? { hero: 1 } : {});
  const pointerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [dialogue, setDialogue] = useState(null);
  const [introPhase, setIntroPhase] = useState(
    introInitiallySeenRef.current ? INTRO_COMPLETE : INTRO_IDLE,
  );
  const [ambientClipName, setAmbientClipName] = useState(null);
  const ambientCooldownRef = useRef(Date.now() + randomBetween(6000, 10000));
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [locomotionReady, setLocomotionReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const currentSection = useActivePortfolioSection(sectionTargets);
  const introActive = introPhase !== INTRO_COMPLETE;
  const movement = useCompanionMovement({
    paused: dialogue !== null || introActive || ambientClipName !== null || !locomotionReady,
    reducedMotion,
  });
  const viewportWidth = useViewportWidth();
  const animation = useCompanionAnimation({
    movementMode: movement.mode,
    dialogueOpen: dialogue !== null,
    reducedMotion,
    ambientClipName,
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      preloadCompanionClip('idle'),
      preloadCompanionClip('move'),
      preloadCompanionClip('drag'),
    ]).then(() => {
      if (active) setLocomotionReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const settlePointerInteraction = useCallback((pointerId = null) => {
    const pointer = pointerRef.current;
    if (!pointer || (pointerId !== null && pointer.id !== pointerId)) return false;

    pointerRef.current = null;
    if (characterRef.current?.hasPointerCapture?.(pointer.id)) {
      characterRef.current.releasePointerCapture?.(pointer.id);
    }
    if (pointer.dragging) {
      suppressClickRef.current = true;
      movement.endDrag();
    }
    setDragOffsetY(0);
    return pointer.dragging;
  }, [movement.endDrag]);

  useEffect(() => {
    const finishPointer = (event) => settlePointerInteraction(event.pointerId);
    const finishInterruptedPointer = () => settlePointerInteraction();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') finishInterruptedPointer();
    };

    window.addEventListener('pointerup', finishPointer, true);
    window.addEventListener('pointercancel', finishPointer, true);
    window.addEventListener('blur', finishInterruptedPointer);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pointerup', finishPointer, true);
      window.removeEventListener('pointercancel', finishPointer, true);
      window.removeEventListener('blur', finishInterruptedPointer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settlePointerInteraction]);

  useEffect(() => {
    if (reducedMotion || dialogue !== null || introActive || movement.mode !== 'idle') {
      if (ambientClipName !== null) setAmbientClipName(null);
      return undefined;
    }

    let delay;
    let nextClip;

    if (ambientClipName === TAKEOVER_RAISE) {
      delay = clipDuration(TAKEOVER_RAISE);
      nextClip = TAKEOVER_LOOP;
    } else if (ambientClipName === TAKEOVER_LOOP) {
      delay = randomBetween(5000, 10000);
      nextClip = TAKEOVER_FINISH;
    } else if (ambientClipName === TAKEOVER_FINISH) {
      delay = clipDuration(TAKEOVER_FINISH);
      nextClip = null;
    } else {
      delay = Math.max(800, ambientCooldownRef.current - Date.now());
      nextClip = TAKEOVER_RAISE;
      preloadCompanionClip(TAKEOVER_RAISE);
      preloadCompanionClip(TAKEOVER_LOOP);
      preloadCompanionClip(TAKEOVER_FINISH);
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (nextClip) await preloadCompanionClip(nextClip);
      if (cancelled) return;
      if (ambientClipName === TAKEOVER_FINISH) {
        ambientCooldownRef.current = Date.now() + randomBetween(18000, 30000);
      }
      setAmbientClipName(nextClip);
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ambientClipName, dialogue, introActive, movement.mode, reducedMotion]);

  const closeDialogue = useCallback(() => {
    if (introPhase === INTRO_DIALOGUE) {
      setIntroPhase(INTRO_COMPLETE);
    }
    setDialogue(null);
  }, [introPhase]);

  const startIntro = useCallback(() => {
    rememberCompanionIntro();
    seenCountRef.current.hero = Math.max(1, seenCountRef.current.hero || 0);
    setIntroPhase(INTRO_DIALOGUE);
    setDialogue(companionIntroDialogue);
  }, []);

  const openDialogue = () => {
    setAmbientClipName(null);
    animation.playTapReaction();
    const seenCount = seenCountRef.current[currentSection] || 0;
    setDialogue(getCompanionDialogue(currentSection, seenCount));
    seenCountRef.current[currentSection] = seenCount + 1;
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const characterBounds = event.currentTarget.getBoundingClientRect();
    setAmbientClipName(null);
    suppressClickRef.current = false;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baselineRootY: characterBounds.bottom,
      spriteHeight: characterBounds.height,
      facing: movement.facing,
      dragging: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    preloadCompanionClip('drag');
  };

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
    if (!pointer.dragging && distance >= 8) {
      pointer.dragging = true;
      movement.beginDrag();
    }
    if (!pointer.dragging) return;

    event.preventDefault();
    const dragClip = companionClips.drag;
    const dragGrab = dragClip.semanticAnchors.dragGrab;
    const frameScale = pointer.spriteHeight / dragClip.frameHeight;
    const sourceDirection = pointer.facing === dragClip.sourceFacing ? 1 : -1;
    const grabOffsetX = (dragGrab.x - dragClip.footAnchor.x) * frameScale * sourceDirection;
    const grabOffsetY = (dragGrab.y - dragClip.footAnchor.y) * frameScale;
    const desiredRootY = event.clientY - grabOffsetY;

    movement.dragTo(event.clientX - grabOffsetX);
    setDragOffsetY(desiredRootY - pointer.baselineRootY);
  };

  const finishPointerInteraction = (event) => {
    settlePointerInteraction(event.pointerId);
  };

  const handleCharacterClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (dialogue !== null) {
      animation.playTapReaction();
      return;
    }
    if (introPhase === INTRO_IDLE) {
      startIntro();
      return;
    }
    openDialogue();
  };

  const navigateToProject = (id) => {
    const target = document.getElementById(id);
    setDialogue(null);
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const bubbleMetrics = useMemo(() => {
    const edge = viewportWidth < 768 ? 10 : 16;
    const width = Math.min(viewportWidth - edge * 2, viewportWidth < 768 ? 300 : 320);
    const left = clamp(movement.x - width / 2, edge, viewportWidth - width - edge);
    const tailLeft = clamp(movement.x - left, 22, width - 22);
    return { left, width, tailLeft };
  }, [movement.x, viewportWidth]);

  const clip = animation.clip;
  const spriteStyle = {
    '--frame-width-factor': clip.frameWidth / clip.frameHeight,
    '--foot-left-factor': -clip.footAnchor.x / clip.frameHeight,
    '--foot-origin': `${(clip.footAnchor.x / clip.frameWidth) * 100}%`,
  };

  return (
    <div
      className="green-colleague"
      data-section={currentSection}
      data-motion={movement.mode}
      data-clip={animation.clipName}
      data-intro={introPhase}
      ref={rootRef}
      style={{
        '--companion-x': `${movement.x}px`,
        '--companion-drag-offset-y': `${dragOffsetY}px`,
      }}
    >
      {dialogue ? (
        <DialogueBubble
          dialogue={dialogue}
          projectAnchors={projectAnchors}
          onNavigate={navigateToProject}
          onClose={closeDialogue}
          style={{
            '--bubble-left': `${bubbleMetrics.left}px`,
            '--bubble-width': `${bubbleMetrics.width}px`,
            '--bubble-tail-left': `${bubbleMetrics.tailLeft}px`,
          }}
        />
      ) : null}

      <button
        className="green-colleague__character"
        ref={characterRef}
        type="button"
        style={spriteStyle}
        onClick={handleCharacterClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerInteraction}
        onPointerCancel={finishPointerInteraction}
        onLostPointerCapture={finishPointerInteraction}
        onPointerEnter={() => {
          preloadCompanionClip('tapReactA');
          preloadCompanionClip('tapReactB');
          preloadCompanionClip('drag');
        }}
        onFocus={() => {
          preloadCompanionClip('tapReactA');
          preloadCompanionClip('tapReactB');
        }}
        aria-label={`戳一下绿毛同事。当前正在看${sectionTargets.find((item) => item.context === currentSection)?.label || '作品集'}`}
        aria-expanded={dialogue !== null}
      >
        <img
          key={animation.clipName}
          className="green-colleague__sprite"
          src={animation.frameSrc}
          width={clip.frameWidth}
          height={clip.frameHeight}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable="false"
          data-facing={movement.facing}
        />
      </button>
    </div>
  );
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
