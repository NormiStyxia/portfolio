import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, Mail, Maximize2, Mic, Play, Plus, Send, Sparkles, Wrench } from 'lucide-react';
import { portfolioAssets } from './data/assets.js';
import { portfolioData } from './data/portfolioData.js';
import { SiteHeader } from './components/SiteHeader.jsx';

const sectionClass = 'mx-auto w-full max-w-6xl px-5 sm:px-8';
const toolHashById = {
  editor: '#tools-editor',
  ai: '#tools-ai',
};
const mobileVideoQuery = '(max-width: 767px), (hover: none), (pointer: coarse)';

function getToolFromHash() {
  if (typeof window === 'undefined') {
    return 'editor';
  }

  return window.location.hash === toolHashById.ai ? 'ai' : 'editor';
}

function externalLinkProps(href) {
  if (!/^https?:\/\//.test(href)) {
    return {};
  }

  return {
    onClick: (event) => {
      event.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    },
    rel: 'noreferrer',
    target: '_blank',
  };
}

function isMobileVideoEnvironment() {
  if (typeof window === 'undefined') {
    return false;
  }

  const touchLikeDevice = window.matchMedia?.(mobileVideoQuery).matches;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|MicroMessenger/i.test(window.navigator.userAgent);
  return Boolean(touchLikeDevice || mobileUserAgent);
}

function useMobileVideoMode() {
  const [isMobileVideoMode, setIsMobileVideoMode] = useState(isMobileVideoEnvironment);

  useEffect(() => {
    const media = window.matchMedia?.(mobileVideoQuery);
    const updateMode = () => setIsMobileVideoMode(isMobileVideoEnvironment());

    updateMode();

    if (!media) return undefined;

    media.addEventListener?.('change', updateMode);
    media.addListener?.(updateMode);

    return () => {
      media.removeEventListener?.('change', updateMode);
      media.removeListener?.(updateMode);
    };
  }, []);

  return isMobileVideoMode;
}

function LazyVideo({
  src,
  poster,
  title,
  className = '',
  controls = false,
  muted = true,
  fit = 'cover',
  mobileOverlay = 'center',
  mobileHint = '点击播放',
  autoPlayOnMobileTap = true,
}) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const isMobileVideoMode = useMobileVideoMode();
  const [isInView, setIsInView] = useState(false);
  const [isMobileActivated, setIsMobileActivated] = useState(false);

  useEffect(() => {
    const node = rootRef.current;

    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting || entry.intersectionRatio > 0;
        setIsInView(visible);

        if (!visible) {
          videoRef.current?.pause();
        }
      },
      { rootMargin: '160px 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shouldAttachSource = Boolean(src && isInView && (!isMobileVideoMode || isMobileActivated));
  const showMobilePoster = Boolean(isMobileVideoMode && !isMobileActivated);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!shouldAttachSource) {
      video.pause();
      return;
    }

    if (src && video.getAttribute('src') !== src) {
      video.setAttribute('src', src);
      video.load();
    }
  }, [shouldAttachSource, src]);

  const activateMobileVideo = async () => {
    const video = videoRef.current;

    if (!src || !video) return;

    setIsMobileActivated(true);

    if (video.getAttribute('src') !== src) {
      video.setAttribute('src', src);
      video.load();
    }

    if (autoPlayOnMobileTap) {
      await video.play().catch(() => {
        // Mobile browsers may require the native play control after source loading.
      });
    }
  };

  const handleEnded = () => {
    if (!isMobileVideoMode) return;

    const video = videoRef.current;
    video?.pause();

    if (video) {
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    }

    setIsMobileActivated(false);
  };

  return (
    <div ref={rootRef} className={`lazy-video ${showMobilePoster ? 'lazy-video--poster' : ''} ${className}`}>
      <video
        ref={videoRef}
        className={`h-full w-full object-${fit}`}
        controls={controls && (!isMobileVideoMode || isMobileActivated)}
        muted={muted}
        playsInline
        webkit-playsinline="true"
        poster={poster}
        preload="metadata"
        aria-label={title}
        data-lazy-src={src}
        onEnded={handleEnded}
      />
      {showMobilePoster ? (
        <span
          className={`lazy-video__play lazy-video__play--${mobileOverlay} ui-button-text`}
          onClick={mobileOverlay === 'compact' ? undefined : activateMobileVideo}
          onKeyDown={
            mobileOverlay === 'compact'
              ? undefined
              : (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateMobileVideo();
                  }
                }
          }
          role={mobileOverlay === 'compact' ? undefined : 'button'}
          tabIndex={mobileOverlay === 'compact' ? undefined : 0}
          aria-label={mobileHint}
        >
          <Play size={mobileOverlay === 'compact' ? 15 : 22} fill="currentColor" strokeWidth={1.8} />
          {mobileOverlay === 'compact' ? <span>{mobileHint}</span> : null}
        </span>
      ) : null}
    </div>
  );
}

function playPreviewVideo(event) {
  if (isMobileVideoEnvironment()) return;

  const video = event.currentTarget.querySelector('video');

  if (!video) return;

  const lazySource = video.dataset.lazySrc;
  if (lazySource && video.getAttribute('src') !== lazySource) {
    video.setAttribute('src', lazySource);
    video.load();
  }

  video.currentTime = 0;
  video.play().catch(() => {
    // Browsers may still block preview playback in edge cases; the modal keeps manual controls.
  });
}

function stopPreviewVideo(event) {
  if (isMobileVideoEnvironment()) return;

  const video = event.currentTarget.querySelector('video');

  if (!video) return;

  video.pause();
  video.currentTime = 0;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function ButtonLink({ href, children, variant = 'primary' }) {
  const styles =
    variant === 'primary'
      ? 'border-skyglass bg-white/80 text-ink shadow-[0_10px_24px_rgba(97,145,184,0.16)]'
      : 'border-line/70 bg-shell/65 text-muted';

  return (
    <a
      className={`ui-button-text inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2 backdrop-blur transition hover:-translate-y-0.5 hover:border-gold hover:text-ink ${styles}`}
      href={href}
      {...externalLinkProps(href)}
    >
      {children}
      <ArrowUpRight size={16} strokeWidth={1.8} />
    </a>
  );
}

function RibbonButton({ href, children, skin, className = '' }) {
  return (
    <a className={`hero-ribbon-button ui-button-text ${className}`} href={href} {...externalLinkProps(href)}>
      <img className="hero-ribbon-button__skin" src={skin.src} alt="" aria-hidden="true" decoding="async" />
      <span className="hero-ribbon-button__content">
        {children}
        <ArrowUpRight size={15} strokeWidth={1.8} />
      </span>
    </a>
  );
}

function Panel({ children, className = '', ...props }) {
  return (
    <div className={`rounded-[24px] border border-white/80 bg-white/62 shadow-panel backdrop-blur ${className}`} {...props}>
      {children}
    </div>
  );
}

function RomanClockDecor() {
  const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  return (
    <div className="archive-section__clock" aria-hidden="true">
      <div className="roman-clock__ring" />
      <div className="roman-clock__inner-ring" />
      {numerals.map((numeral, index) => (
        <span key={numeral} className="roman-clock__numeral" style={{ '--i': index }}>
          {numeral}
        </span>
      ))}
      <span className="roman-clock__hand roman-clock__hand--hour" />
      <span className="roman-clock__hand roman-clock__hand--minute" />
      <span className="roman-clock__hand roman-clock__hand--second" />
      <span className="roman-clock__center" />
    </div>
  );
}

function DecoratedSection({
  id,
  children,
  type = 'soft',
  className = '',
  contentClassName = '',
  showClock = false,
  showBird = false,
  showGrid = false,
}) {
  const { frame, bird } = portfolioAssets.uiSkin;

  return (
    <section id={id} className={`${sectionClass} py-12 ${className}`}>
      <div className={`archive-section archive-section--${type}`}>
        <img className="archive-section__frame" src={frame.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        {showClock ? <RomanClockDecor /> : null}
        {showBird ? <img className="archive-section__bird" src={bird.src} alt="" aria-hidden="true" loading="lazy" decoding="async" /> : null}
        {showGrid ? <div className="archive-section__grid" aria-hidden="true" /> : null}
        <div className={`archive-section__content ${contentClassName}`}>{children}</div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, children, asideImage, wide = false }) {
  return (
    <div className={`mb-8 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <p className="caption-text text-muted">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-5">
        <div className="section-title-wrap">
          <span className="section-corner-star section-corner-star--left" aria-hidden="true" />
          <h2 className={`section-title text-ink ${wide ? 'section-title--wide' : ''}`}>{title}</h2>
          <span className="section-corner-star section-corner-star--right" aria-hidden="true" />
        </div>
        {asideImage ? (
          <img className="project-title-mascot" src={asideImage.src} alt={asideImage.title} loading="lazy" decoding="async" />
        ) : null}
      </div>
      {Array.isArray(children) ? (
        <div className="mt-4 space-y-3">
          {children.map((paragraph) => (
            <p key={paragraph} className="body-text text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      ) : children ? (
        <p className="body-text mt-4 text-muted">{children}</p>
      ) : null}
    </div>
  );
}

function ScreenshotFrame({ image, label, tall = false }) {
  return (
    <figure className="overflow-hidden rounded-[18px] border border-white/90 bg-shell/60">
      <div className={`bg-skyglass/30 ${tall ? 'aspect-[4/3]' : 'aspect-video'}`}>
        <img className="h-full w-full object-cover" src={image.src} alt={image.title} loading="lazy" decoding="async" />
      </div>
      <figcaption className="caption-text flex items-center justify-between px-4 py-3 text-muted">
        <span>{label}</span>
        <Maximize2 size={14} strokeWidth={1.7} />
      </figcaption>
    </figure>
  );
}

function GameplayVideoFrame({ video, poster, label }) {
  return (
    <figure className="overflow-hidden rounded-[22px] border border-white/90 bg-shell/60 shadow-[inset_0_0_0_1px_rgba(137,169,202,0.18)]">
      <div className="relative aspect-video bg-skyglass/30">
        {video?.src ? (
          <LazyVideo
            className="h-full w-full"
            controls
            mobileHint="播放预览"
            poster={poster?.src}
            src={video.src}
            title={video.title}
          />
        ) : poster?.src ? (
          <div className="group relative h-full w-full overflow-hidden">
            <img className="h-full w-full object-cover opacity-90" src={poster.src} alt={poster.title} loading="lazy" decoding="async" />
            <div className="absolute inset-0 grid place-items-center bg-white/10">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/80 bg-white/70 text-[#4f7897] shadow-[0_14px_34px_rgba(76,123,166,0.18)] backdrop-blur">
                <Play size={24} fill="currentColor" />
              </span>
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Play className="mx-auto text-[#4f7897]" size={34} />
              <p className="ui-tag-text mt-3 text-muted">Gameplay video placeholder</p>
            </div>
          </div>
        )}
      </div>
      <figcaption className="caption-text flex items-center justify-between px-4 py-3 text-muted">
        <span>{label}</span>
        <Play size={14} fill="currentColor" strokeWidth={1.7} />
      </figcaption>
    </figure>
  );
}

function HeroSection() {
  const { profile, heroActions } = portfolioData;
  const [projectAction, demoAction, editorAction, galleryAction, workflowAction] = heroActions;
  const { frame, bird, titleRibbon } = portfolioAssets.uiSkin;
  const { avatar, bottomFlowers, splitBirds, cornerBird } = portfolioAssets.heroProfile;

  return (
    <section id="top" className={`${sectionClass} pt-10 sm:pt-14`}>
      <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-gradient-to-br from-white/86 via-shell/76 to-skyglass/56 px-5 py-6 shadow-panel sm:px-8 sm:py-12">
        <img className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.22]" src={frame.src} alt="" aria-hidden="true" decoding="async" />
        <div className="pointer-events-none absolute left-8 top-8 hidden h-16 w-16 rotate-45 border border-white/75 sm:block" />
        <img className="pointer-events-none absolute bottom-8 right-9 hidden w-16 opacity-70 sm:block" src={bird.src} alt="" aria-hidden="true" decoding="async" />

        <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
          <div className="relative mx-auto w-full max-w-[230px] sm:max-w-[340px] lg:mx-0">
            <div className="absolute -inset-4 rounded-[36px] bg-skyglass/50 blur-2xl" />
            <div className="relative rotate-[-1.4deg] rounded-[30px] border border-line/80 bg-white/72 p-4 shadow-[0_22px_70px_rgba(78,126,168,0.22)] backdrop-blur">
              <div className="relative aspect-square overflow-hidden rounded-[22px] border-2 border-[#2d5d9d]/85 bg-shell">
                <img className="h-full w-full scale-[1.12] object-cover" src={avatar.src} alt={avatar.title} loading="eager" decoding="async" fetchPriority="high" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),transparent_42%,rgba(217,236,250,0.2))]" />
              </div>
              <img className="hero-float-birds pointer-events-none absolute left-1/2 top-1/2 z-10 w-[135%] max-w-none opacity-95" src={splitBirds.src} alt="" aria-hidden="true" loading="eager" decoding="async" />
              <img className="hero-float-flowers pointer-events-none absolute left-1/2 bottom-[-17%] z-20 w-[128%] max-w-none opacity-95" src={bottomFlowers.src} alt="" aria-hidden="true" loading="eager" decoding="async" />
              <img className="hero-corner-bird pointer-events-none absolute" src={cornerBird.src} alt="" aria-hidden="true" loading="eager" decoding="async" />
            </div>
          </div>

          <div className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <p className="caption-text text-muted">CREATOR CARD</p>
              <span className="ui-tag-text rounded-full border border-line/80 bg-white/78 px-3 py-1 text-[#315f9f] shadow-[0_8px_24px_rgba(97,145,184,0.12)]">
                {profile.level}
              </span>
            </div>
            <div className="profile-name-wrap mt-4">
              <span className="profile-corner-star profile-corner-star--left" aria-hidden="true" />
              <h1 className="profile-name text-ink">{profile.displayName}</h1>
              <span className="profile-corner-star profile-corner-star--right" aria-hidden="true" />
            </div>
            <p className="ui-tag-text mt-3 text-[#4f7897]">{profile.role}</p>
            <div className="body-text mt-5 max-w-2xl rounded-[22px] border border-line/75 bg-white/64 px-5 py-4 text-[#6f829a] shadow-[0_14px_38px_rgba(97,145,184,0.14)] backdrop-blur">
              {profile.note}
            </div>

            <div className="mt-5 flex max-w-2xl flex-wrap gap-2 sm:mt-6">
              {profile.tags.map((tag) => (
                <span key={tag} className="ui-tag-text rounded-full border border-line/75 bg-white/70 px-3 py-1 text-muted shadow-[0_8px_24px_rgba(97,145,184,0.12)]">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[#6f829a]">
              <span className="caption-text normal-case tracking-[0.08em]">Explore:</span>
              {[demoAction, editorAction, galleryAction, workflowAction].map((action) => (
                <a key={action.href} className="hero-explore-link ui-tag-text" href={action.href}>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="hero-transition-cta">
        <RibbonButton href={projectAction.href} skin={titleRibbon}>
          {projectAction.label}
        </RibbonButton>
      </div>
    </section>
  );
}

function GameDemoSection() {
  const { mainProject } = portfolioData;
  const demoPoster = portfolioAssets.gameScreenshots[4];
  const gameplayVideo = portfolioAssets.gameplayVideo;
  const { titleRibbon } = portfolioAssets.uiSkin;

  return (
    <DecoratedSection id="project" type="game" className="pb-14 pt-8" contentClassName="relative">
      <div className="relative z-10 lg:pr-[24rem] xl:pr-[28rem]">
        <SectionTitle eyebrow={mainProject.demo.subtitle} title={mainProject.title} asideImage={portfolioAssets.projectMascot}>
          {mainProject.summary}
        </SectionTitle>
      </div>

      <div className="relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1.32fr_0.68fr]">
          <Panel className="p-4" id="tapmaker-demo">
            <GameplayVideoFrame video={gameplayVideo} poster={demoPoster} label="序章实机画面" />
          </Panel>

          <Panel className="p-5">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-line/80 bg-white/70 text-[#4f7897]">
                  <Play size={18} fill="currentColor" />
                </span>
                <h3 className="card-title">{mainProject.demo.title}</h3>
              </div>
              <p className="body-text mt-4 text-muted">{mainProject.demo.summary}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {mainProject.demo.facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-line/65 bg-white/58 px-4 py-3 shadow-[0_10px_24px_rgba(97,145,184,0.09)]">
                    <p className="ui-tag-text text-[#6f829a]">{fact.label}</p>
                    <p className="ui-button-text mt-1 text-ink">{fact.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <RibbonButton href={mainProject.demo.href} skin={titleRibbon}>
                  {mainProject.demo.linkLabel}
                </RibbonButton>
              </div>
            </div>
          </Panel>
        </div>

      </div>
      <img className="prologue-illustration" src={portfolioAssets.prologueIllustration.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </DecoratedSection>
  );
}

function ToolSection() {
  const { editor } = portfolioData.mainProject;
  const editorPoster = portfolioAssets.levelEngineeringPoster;
  const [activeTool, setActiveTool] = useState(getToolFromHash);
  const tools = [
    {
      id: 'editor',
      line: 'TOOL LINE 01',
      title: '可视化编辑器',
      subtitle: 'Visual Level Editor',
      detail: 'NodeCanvas · 属性面板 · 实时预览',
    },
    {
      id: 'ai',
      line: 'TOOL LINE 02',
      title: 'AI 协作流程',
      subtitle: 'AI Sync Workflow',
      detail: 'Event → Intent → Patch · Diff · Snapshot',
    },
  ];
  const aiTags = ['AI Sync', '日志通道', 'grouped v4', 'Diff 预览', 'Snapshot 归档', '避免全量传输'];

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTool(getToolFromHash());
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  const selectTool = (toolId) => {
    setActiveTool(toolId);
    window.history.pushState(null, '', toolHashById[toolId]);
  };

  return (
    <DecoratedSection id="tools" type="process" showGrid>
      <span id="tools-editor" className="tool-anchor" aria-hidden="true" />
      <span id="tools-ai" className="tool-anchor" aria-hidden="true" />
      <SectionTitle eyebrow="GROWN FROM THE DEMO" title="从游戏项目里长出的制作工具" wide>
        在继续制作《幻界行者·序章》的过程中，关卡配置和机制调试逐渐变得复杂。为了让 AI 不只是“直接改文件”，而是能理解编辑器中的真实操作，我围绕这个 Demo 搭建了一套可追踪、可审查的 AI 协作流程。
      </SectionTitle>

      <p className="tool-switch-hint ui-tag-text">✦ 选择一条工具线，查看它如何从 Demo 中生长出来。</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-branch-card text-left ${activeTool === tool.id ? 'tool-branch-card--active' : ''}`}
            onClick={() => selectTool(tool.id)}
            type="button"
          >
            <span className="tool-branch-card__action ui-tag-text">{activeTool === tool.id ? '当前展示' : '点击查看'} <ArrowUpRight size={13} strokeWidth={1.8} /></span>
            <span className="ui-tag-text text-[#6f829a]">{tool.line}</span>
            <strong className="card-title mt-2 block text-ink">{tool.title}</strong>
            <span className="ui-tag-text mt-1 block text-[#4f7897]">{tool.subtitle}</span>
            <span className="body-text mt-2 block text-muted">{tool.detail}</span>
          </button>
        ))}
      </div>

      <div className="tool-content-panel mt-5" key={activeTool}>
        {activeTool === 'editor' ? (
          <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
            <Panel className="p-4">
              <GameplayVideoFrame video={portfolioAssets.editorShowcaseVideo} poster={editorPoster} label={editor.videoTitle} />
              <p className="archive-note ui-tag-text mt-4">
                ✦ 目前编辑器迁移与复用实验已完成，架构说明、设计思路、同步协议和实践经验整理已提交至 TapTap 制造 Skills Hub，供参考交流。
              </p>
            </Panel>

            <Panel className="p-6">
              <p className="caption-text text-muted">LEVEL ENGINEERING BREAKDOWN</p>
              <h3 className="card-title mt-3">{editor.videoTitle}</h3>
              <p className="body-text mt-4 text-muted">{editor.videoSummary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {editor.features.map((feature) => (
                  <span key={feature} className="ui-tag-text rounded-full border border-line/70 bg-white/58 px-3 py-1 text-muted">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={editor.href}>{editor.linkLabel}</ButtonLink>
                <ButtonLink href={editor.postHref} variant="secondary">
                  {editor.postLabel}
                </ButtonLink>
              </div>
            </Panel>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <Panel className="p-6">
              <p className="caption-text text-muted">AI SYNC WORKFLOW</p>
              <h3 className="card-title mt-3">让 AI 读懂增量，而不是搬运全量 JSON</h3>
              <p className="body-text mt-4 text-muted">
                我没有把完整关卡 JSON 作为常规同步入口。全量数据本身不是问题，但它太大，每次传输都会增加日志体积、加载时间和 Agent 推理成本，也容易让真正发生的改动被埋在大量状态数据里。
                因此我通过日志通道导出 AI_SYNC 增量协议：当我对 Agent 说“同步编辑器修改”时，它会从预览日志中读取最新增量改动并写入本地关卡文件，同时自动归档 Diff 与完整 Snapshot，方便后续审查、对照和问题回溯。
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {aiTags.map((tag) => (
                  <span key={tag} className="ui-tag-text rounded-full border border-line/70 bg-white/58 px-3 py-1 text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel className="p-6">
              <p className="caption-text text-muted">EVENT TO PATCH</p>
              <div className="mt-5 grid gap-3">
                {[
                  ['Event', '记录编辑器中的原始操作，例如对象选择、属性修改、节点连接与配置变化。'],
                  ['Intent', '将原始操作整理成更接近“用户意图”的语义改动，让 Agent 关注要改什么，而不是猜完整 JSON 结构。'],
                  ['Patch', '把语义改动编译成可执行的增量补丁，只同步真正发生变化的部分。'],
                  ['Diff / Snapshot', 'Diff 用来把改动列表直观呈现给开发者，方便人工对照；Snapshot 则作为完整快照归档，在协议压缩或字段裁剪出现问题时用于恢复和排查。'],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-2xl border border-line/65 bg-white/58 px-4 py-3">
                    <p className="ui-button-text text-ink">{title}</p>
                    <p className="body-text mt-1 text-muted">{detail}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </DecoratedSection>
  );
}

function ArtGallerySection() {
  const [activeImage, setActiveImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('motion');
  const categories = portfolioData.gallery.categories;
  const items = portfolioAssets.artGallery.filter((item) => item.category === activeCategory);
  const activeCategoryData = categories.find((category) => category.value === activeCategory);

  return (
    <DecoratedSection id="gallery" type="gallery" showBird>
      <SectionTitle eyebrow="美术素材" title="游戏 UI 与美术资源">
        这里收录《幻界行者·序章》中的界面、动效与角色素材，还有我的一些个人手绘作品。比起单张截图，我更希望它们能一起呈现这个小世界逐渐成形的样子。
      </SectionTitle>
      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            className={`gallery-tab ui-tag-text ${activeCategory === category.value ? 'gallery-tab--active' : ''}`}
            onClick={() => setActiveCategory(category.value)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
      <p className="gallery-note body-text mb-5">{activeCategoryData?.note}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.src}
            className="group overflow-hidden rounded-[22px] border border-white/85 bg-white/58 p-3 text-left shadow-panel backdrop-blur transition hover:-translate-y-1 hover:border-gold"
            onClick={() => setActiveImage(item)}
            onMouseEnter={item.type === 'video' ? playPreviewVideo : undefined}
            onMouseLeave={item.type === 'video' ? stopPreviewVideo : undefined}
            type="button"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-shell/70">
              {item.type === 'video' ? (
                <>
                  <LazyVideo
                    className="h-full w-full transition duration-300 group-hover:scale-[1.03] group-hover:brightness-[1.04]"
                    mobileHint="点击播放"
                    mobileOverlay="compact"
                    poster={item.poster}
                    src={item.src}
                    title={item.title}
                  />
                  <span className="gallery-video-badge ui-tag-text">VIDEO</span>
                  <span className="gallery-video-hint ui-tag-text">悬停预览 · 点击播放</span>
                </>
              ) : (
                <img className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]" src={item.src} alt={item.title} loading="lazy" decoding="async" />
              )}
            </div>
            <div className="mt-3">
              <p className="card-title text-[1.25rem] leading-snug text-ink">{item.title}</p>
              <p className="body-text mt-1 text-muted">{item.description}</p>
              <p className="ui-tag-text mt-2 text-skydeep">{item.tags}</p>
            </div>
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-5 backdrop-blur-sm"
          onClick={() => setActiveImage(null)}
          role="presentation"
        >
          <div className="max-h-[90vh] max-w-5xl rounded-[24px] border border-white/80 bg-mist p-4 shadow-panel" onClick={(event) => event.stopPropagation()}>
            {activeImage.type === 'video' ? (
              <video
                className="max-h-[76vh] w-full rounded-2xl object-contain"
                controls
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
                poster={activeImage.poster}
                preload="metadata"
              >
                <source src={activeImage.src} type="video/mp4" />
              </video>
            ) : (
              <img className="max-h-[76vh] w-full object-contain" src={activeImage.src} alt={activeImage.title} decoding="async" />
            )}
            <div className="ui-tag-text mt-3 flex items-center justify-between gap-4 text-muted">
              <span>
                <span className="text-ink">{activeImage.title}</span>
                {activeImage.description ? <span> · {activeImage.description}</span> : null}
                {activeImage.tags ? <span> · {activeImage.tags}</span> : null}
              </span>
              <button className="ui-button-text rounded-full border border-line bg-white/70 px-4 py-2 text-ink" onClick={() => setActiveImage(null)} type="button">
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DecoratedSection>
  );
}

function ProcessSection() {
  const { process } = portfolioData;

  return (
    <DecoratedSection id="process" type="process">
      <div className="process-scene">
        <p className="caption-text text-muted">项目演化 / The First Prompt</p>
        <p className="process-prompt__hint">最开始，没有编辑器，也没有流程，只有一个想做游戏的念头……</p>
        <div className="process-prompt">
          <p className="process-prompt__question">你想做一个什么样的游戏？</p>
          <div className="process-prompt__input">
            <span className="process-prompt__plus" aria-hidden="true">
              <Plus size={22} strokeWidth={1.8} />
            </span>
            <span className="process-prompt__text">
              一个关于我自己的游戏。
              <span className="process-prompt__cursor" aria-hidden="true" />
            </span>
            <span className="process-prompt__actions" aria-hidden="true">
              <span className="process-prompt__icon process-prompt__icon--soft">
                <Mic size={16} strokeWidth={1.8} />
              </span>
              <span className="process-prompt__icon process-prompt__icon--send">
                <Send size={15} strokeWidth={1.9} />
              </span>
            </span>
          </div>
        </div>
        <div className="process-steps grid gap-3 md:grid-cols-4">
          {process.map((step, index) => (
            <div key={step.title} className="process-step-card relative">
              <div className="ui-tag-text text-[#4f7897]">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="card-title mt-2 text-ink">{step.title}</h3>
              <p className="body-text mt-2 text-muted">{step.detail}</p>
              {index < process.length - 1 ? <span className="ui-tag-text absolute -right-3 top-1/2 hidden -translate-y-1/2 text-skyglass md:block">→</span> : null}
            </div>
          ))}
        </div>
      </div>
    </DecoratedSection>
  );
}

function ContactSection() {
  const { contact } = portfolioData;
  const [copiedEmail, setCopiedEmail] = useState(false);
  const links = [
    { label: 'TapTap 主页', href: contact.tapmakerHome, icon: Sparkles },
    { label: 'Bilibili 主页', href: contact.bilibiliHome, icon: Play },
    { label: 'GitHub', href: contact.github, icon: Github },
    { label: copiedEmail ? '邮箱已复制' : '邮箱', href: contact.email, icon: Mail, copy: true },
  ];

  const handleEmailCopy = async () => {
    await copyText(contact.email);
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 1600);
  };

  return (
    <DecoratedSection id="contact" type="soft" className="pb-16 pt-12" showBird>
      <Panel className="contact-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="caption-text text-muted">联系</p>
            <div className="section-title-wrap mt-3">
              <span className="section-corner-star section-corner-star--left" aria-hidden="true" />
              <h2 className="section-title text-ink">如何找到我？</h2>
              <span className="section-corner-star section-corner-star--right" aria-hidden="true" />
            </div>
            <p className="body-text mt-4 text-muted">
              对我的作品感兴趣？想和我交流 AI 游戏创作？寻找 Game Jam 队友？还是单纯想找我聊天？想认识我的话，呐。Sir，this way！
            </p>
          </div>
          <div className="contact-links-grid relative z-10 grid gap-3 sm:grid-cols-2">
            {links.map(({ label, href, icon: Icon, copy }) => {
              const className =
                'contact-link-card ui-button-text flex min-h-16 items-center gap-3 rounded-2xl border border-line/70 bg-shell/60 px-4 py-3 text-left text-ink';

              return copy ? (
                <button key="email-copy" className={className} onClick={handleEmailCopy} type="button">
                  <Icon size={18} className="shrink-0 text-[#4f7897]" />
                  <span className="min-w-0 truncate">{label}</span>
                </button>
              ) : (
                <a key={label} className={className} href={href} {...externalLinkProps(href)}>
                  <Icon size={18} className="shrink-0 text-[#4f7897]" />
                  <span className="min-w-0 truncate">{label}</span>
                </a>
              );
            })}
          </div>
        </div>
        <img className="contact-mascot" src={portfolioAssets.contactMascot.src} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </Panel>
    </DecoratedSection>
  );
}

function ContinuationDivider() {
  return (
    <div className={`${sectionClass} py-2`}>
      <p className="continuation-divider ui-tag-text">✦ 未完待续 · To be continued... ✦</p>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-mist text-ink">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(216,236,250,0.78),transparent_28%),linear-gradient(180deg,#f8fcff_0%,#edf7ff_48%,#f9fbff_100%)]" />
      <SiteHeader name={portfolioData.profile.displayName} />
      <HeroSection />
      <GameDemoSection />
      <ToolSection />
      <ArtGallerySection />
      <ProcessSection />
      <ContinuationDivider />
      <ContactSection />
    </main>
  );
}
