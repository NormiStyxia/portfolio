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

function useCompanionAnimation({ movementMode, dialogueOpen, reducedMotion }) {
  const [reactionClip, setReactionClip] = useState(null);
  const [blinkClip, setBlinkClip] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const baseClip = movementMode === 'drag' ? 'drag' : movementMode === 'walk' ? 'move' : 'idle';
  const activeClipName = movementMode === 'idle'
    ? reactionClip || (blinkClip ? 'blink' : baseClip)
    : baseClip;
  const activeClip = companionClips[activeClipName];

  useEffect(() => {
    if (movementMode === 'idle') return;
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
    if (movementMode !== 'idle' || dialogueOpen || reducedMotion || reactionClip || blinkClip) {
      return undefined;
    }

    const timer = window.setTimeout(() => setBlinkClip(true), 1800 + Math.random() * 2700);
    return () => window.clearTimeout(timer);
  }, [blinkClip, dialogueOpen, movementMode, reactionClip, reducedMotion]);

  const playTapReaction = () => {
    preloadCompanionClip('tapReactA');
    preloadCompanionClip('tapReactB');
    setBlinkClip(false);
    setReactionClip(reactionClips[Math.floor(Math.random() * reactionClips.length)]);
  };

  return {
    clip: activeClip,
    frameSrc: activeClip.frames[Math.min(frameIndex, activeClip.frames.length - 1)],
    playTapReaction,
  };
}

function DialogueBubble({ dialogue, projectAnchors, onNavigate, onClose, onComplete, style }) {
  const [lineIndex, setLineIndex] = useState(0);
  const isLastLine = lineIndex === dialogue.lines.length - 1;

  useEffect(() => {
    setLineIndex(0);
  }, [dialogue]);

  useEffect(() => {
    if (!dialogue.autoAdvance) return undefined;

    const line = dialogue.lines[lineIndex] || '';
    const delay = Math.min(4300, 1500 + line.length * 55);
    const timer = window.setTimeout(() => {
      if (isLastLine) onComplete?.();
      else setLineIndex((current) => current + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [dialogue, isLastLine, lineIndex, onComplete]);

  return (
    <section
      className="green-colleague__bubble"
      aria-label="绿毛同事说"
      aria-live="polite"
      style={style}
    >
      <button className="green-colleague__close" type="button" onClick={onClose} aria-label="收起对话">
        ×
      </button>
      <div className="green-colleague__lines">
        <p>{dialogue.lines[lineIndex]}</p>
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
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const reducedMotion = useReducedMotion();
  const currentSection = useActivePortfolioSection(sectionTargets);
  const introActive = introPhase !== INTRO_COMPLETE;
  const movement = useCompanionMovement({ paused: dialogue !== null || introActive, reducedMotion });
  const viewportWidth = useViewportWidth();
  const animation = useCompanionAnimation({
    movementMode: movement.mode,
    dialogueOpen: dialogue !== null,
    reducedMotion,
  });

  const completeIntro = useCallback(() => {
    rememberCompanionIntro();
    seenCountRef.current.hero = Math.max(1, seenCountRef.current.hero || 0);
    setIntroPhase(INTRO_COMPLETE);
    setDialogue(null);
  }, []);

  useEffect(() => {
    if (introPhase !== INTRO_IDLE) return undefined;
    if (currentSection !== 'hero') {
      completeIntro();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      rememberCompanionIntro();
      setDialogue(companionIntroDialogue);
      setIntroPhase(INTRO_DIALOGUE);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [completeIntro, currentSection, introPhase]);

  useEffect(() => {
    if (introActive) {
      if (currentSection !== 'hero') completeIntro();
      return;
    }
    setDialogue(null);
  }, [completeIntro, currentSection, introActive]);

  useEffect(() => {
    if (!dialogue) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        if (introActive) completeIntro();
        else setDialogue(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (introActive) completeIntro();
        else setDialogue(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [completeIntro, dialogue, introActive]);

  const openDialogue = () => {
    animation.playTapReaction();
    const seenCount = seenCountRef.current[currentSection] || 0;
    setDialogue(getCompanionDialogue(currentSection, seenCount));
    seenCountRef.current[currentSection] = seenCount + 1;
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const characterBounds = event.currentTarget.getBoundingClientRect();
    if (introActive) completeIntro();
    else setDialogue(null);
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
    const minimumRootY = pointer.spriteHeight + 8;
    const clampedRootY = Math.max(minimumRootY, Math.min(pointer.baselineRootY, desiredRootY));

    movement.dragTo(event.clientX - grabOffsetX);
    setDragOffsetY(clampedRootY - pointer.baselineRootY);
  };

  const finishPointerInteraction = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    if (pointer.dragging) {
      suppressClickRef.current = true;
      movement.endDrag();
      setDragOffsetY(0);
    }
  };

  const handleCharacterClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
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
          onClose={introActive ? completeIntro : () => setDialogue(null)}
          onComplete={introActive ? completeIntro : undefined}
          style={{
            '--bubble-left': `${bubbleMetrics.left}px`,
            '--bubble-width': `${bubbleMetrics.width}px`,
            '--bubble-tail-left': `${bubbleMetrics.tailLeft}px`,
          }}
        />
      ) : null}

      <button
        className="green-colleague__character"
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
          className="green-colleague__sprite"
          src={animation.frameSrc}
          alt=""
          aria-hidden="true"
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
