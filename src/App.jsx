import { useCallback, useEffect, useState } from 'react';
import { PortfolioLoader } from './bootstrap/PortfolioLoader.jsx';
import { GlobalNavigation } from './components/GlobalNavigation.jsx';
import { MediaFigure } from './components/MediaFigure.jsx';
import { GreenColleague } from './companion/GreenColleague.jsx';
import { projects } from './data/projects.js';
import { site } from './data/site.js';
import { useSectionMotion } from './motion/useSectionMotion.js';
import { useActivePortfolioSection } from './navigation/useActivePortfolioSection.js';

const portfolioSections = [
  { context: 'hero', id: 'hero', label: '首页', dialogueContext: 'hero' },
  { context: 'selected', id: 'selected-intro', label: '代表作品', dialogueContext: 'hero' },
  { context: 'newton', id: 'newton-ignore', label: '不经典力学' },
  { context: 'anchor', id: 'anchor-maze', label: 'Anchor Maze' },
  { context: 'crimson', id: 'crimson-leap', label: '绯红之跃' },
  { context: 'realmwalker', id: 'realm-walker-prologue', label: '幻界行者·序章' },
  { context: 'about', id: 'about', label: '关于', dialogueContext: 'about' },
  {
    context: 'footer',
    id: 'footer',
    label: '页尾',
    dialogueContext: 'about',
    scoreBoost: 0.16,
  },
];

const companionProjectAnchors = portfolioSections
  .filter(({ context }) => ['newton', 'anchor', 'crimson', 'realmwalker'].includes(context))
  .map(({ id, label }) => ({ id, label }));

const externalProps = {
  target: '_blank',
  rel: 'noreferrer',
};

const heroLeadHighlight = '这个好像能玩。';
const [heroLeadBefore, heroLeadAfter] = site.whatIDo.lead.split(heroLeadHighlight);

function HeroAvatar({ animatedSrc, posterSrc, animate }) {
  const [src, setSrc] = useState(posterSrc || animatedSrc);

  useEffect(() => {
    if (!animate || !animatedSrc || animatedSrc === posterSrc) return undefined;

    let active = true;
    const image = new Image();
    image.decoding = 'async';
    image.addEventListener('load', async () => {
      try {
        await image.decode();
      } catch {
        // The loaded GIF can still replace its stable poster without changing layout.
      }
      if (active) setSrc(animatedSrc);
    }, { once: true });
    image.src = animatedSrc;

    return () => {
      active = false;
    };
  }, [animate, animatedSrc, posterSrc]);

  return (
    <img
      className="hero__avatar"
      src={src}
      alt="诺米Styxia 蓝白角色创作者头像"
      width="800"
      height="800"
      decoding="async"
    />
  );
}

function ArrowLink({ href, children, external = false }) {
  return (
    <a className="arrow-link" href={href} {...(external ? externalProps : {})}>
      <span>{children}</span>
      <span aria-hidden="true">{external ? '↗' : '→'}</span>
    </a>
  );
}

function ProjectMeta({ project }) {
  const labels = project.metaLabels || {};

  return (
    <dl className="project-meta">
      <div>
        <dt>{labels.role || '职责'}</dt>
        <dd>{project.role.join(' / ')}</dd>
      </div>
      <div>
        <dt>{labels.duration || '周期'}</dt>
        <dd>{project.metaDuration || project.duration}</dd>
      </div>
      {project.engine ? (
        <div>
          <dt>{labels.engine || '引擎'}</dt>
          <dd>{project.engine}</dd>
        </div>
      ) : null}
      <div>
        <dt>{labels.context || '项目背景'}</dt>
        <dd>{project.context || project.platform || project.year}</dd>
      </div>
    </dl>
  );
}

function ProjectLinks({ project }) {
  if (!project.links.tapTap && !project.links.demo && !project.links.caseStudy) {
    return null;
  }

  return (
    <div className="project-links">
      {project.links.caseStudy ? <ArrowLink href={project.links.caseStudy}>查看案例</ArrowLink> : null}
      {project.links.demo ? <ArrowLink href={project.links.demo} external>Demo</ArrowLink> : null}
      {project.links.tapTap ? (
        <ArrowLink href={project.links.tapTap} external>
          {project.links.tapTapLabel || 'TapTap'}
        </ArrowLink>
      ) : null}
    </div>
  );
}

function FlagshipProject({ project, activeSection }) {
  const motion = useSectionMotion('newton', activeSection);

  return (
    <article
      className={`project project--flagship project--newton motion-section ${motion.revealed ? 'is-revealed' : ''}`}
      id={project.id}
      data-motion-active={motion.isActive}
      data-motion-epoch={motion.epoch}
      style={{ '--project-accent': project.accent }}
    >
      <div className="project-rule">
        <span>Project {project.index}</span>
        <span>Flagship / {project.year}</span>
      </div>

      <div className="project-heading project-heading--flagship">
        <div>
          <p className="project-kicker">Selected work / Game design</p>
          <h3>
            <span>{project.title}</span>
            <span className="project-title-latin">{project.englishTitle}</span>
          </h3>
        </div>
        <p className="project-core">{project.coreIdea}</p>
      </div>

      <div className="project-main project-main--flagship">
        <MediaFigure media={project.heroMedia} className="project-media project-media--flagship" />
        <div className="project-sidebar">
          <ProjectMeta project={project} />
          <div className="project-evidence">
            <p className="design-note">{project.summary}</p>
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryProject({ project, activeSection, reverse = false }) {
  const hasDesignNote = project.id === 'anchor-maze' || project.id === 'crimson-leap';
  const sectionContext = project.id === 'anchor-maze' ? 'anchor' : 'crimson';
  const motion = useSectionMotion(sectionContext, activeSection);

  return (
    <article
      className={`project project--secondary motion-section ${motion.revealed ? 'is-revealed' : ''} ${project.id === 'anchor-maze' ? 'project--anchor' : ''} ${project.id === 'crimson-leap' ? 'project--crimson' : ''} ${reverse ? 'project--reverse' : ''}`}
      id={project.id}
      data-motion-active={motion.isActive}
      data-motion-epoch={motion.epoch}
      style={{ '--project-accent': project.accent }}
    >
      <div className="project-rule">
        <span>Project {project.index}</span>
        <span>{project.year} / {project.duration}</span>
      </div>

      <div className="secondary-grid">
        <div className="secondary-copy">
          <p className="project-kicker">{project.platform}</p>
          <h3>
            <span>{project.title}</span>
            {project.englishTitle ? <span className="project-title-latin">{project.englishTitle}</span> : null}
          </h3>
          <p className="project-core">{project.coreIdea}</p>
          <ProjectMeta project={project} />
          {hasDesignNote ? (
            <p className="design-note">{project.summary}</p>
          ) : (
            <ul className="contribution-list">
              {project.contributions.map((contribution) => (
                <li key={contribution}>{contribution}</li>
              ))}
            </ul>
          )}
          <ProjectLinks project={project} />
        </div>
        <MediaFigure media={project.heroMedia} className="project-media project-media--secondary" />
      </div>
    </article>
  );
}

function ArchiveProject({ project, activeSection }) {
  const motion = useSectionMotion('realmwalker', activeSection);

  return (
    <article
      className={`project project--archive project--realmwalker motion-section ${motion.revealed ? 'is-revealed' : ''}`}
      id={project.id}
      data-motion-active={motion.isActive}
      data-motion-epoch={motion.epoch}
      style={{ '--project-accent': project.accent }}
    >
      <svg className="realmwalker-trace" viewBox="0 0 420 90" aria-hidden="true" focusable="false">
        <path d="M4 75 C 90 4, 220 8, 416 65" />
      </svg>
      <div className="project-rule">
        <span>Project {project.index}</span>
        <span>Archive / Origin</span>
      </div>
      <div className="archive-grid">
        <MediaFigure media={project.heroMedia} className="project-media project-media--archive" />
        <div className="archive-copy">
          <p className="project-kicker">Early exploration / {project.year}</p>
          <h3>{project.title}</h3>
          <p className="project-core">{project.coreIdea}</p>
          <ProjectMeta project={project} />
          <p className="design-note">{project.summary}</p>
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

function App() {
  const [newton, anchor, crimson, archive] = projects;
  const [bootstrapPhase, setBootstrapPhase] = useState('loading');
  const revealPortfolio = useCallback(() => setBootstrapPhase('revealing'), []);
  const completeBootstrap = useCallback(() => setBootstrapPhase('ready'), []);
  const activeSection = useActivePortfolioSection(portfolioSections);
  const motionEnabled = bootstrapPhase !== 'loading';
  const heroMotion = useSectionMotion('hero', activeSection, { enabled: motionEnabled });
  const selectedMotion = useSectionMotion('selected', activeSection, { enabled: motionEnabled });
  const aboutMotion = useSectionMotion('about', activeSection, { enabled: motionEnabled });
  const footerMotion = useSectionMotion('footer', activeSection, { enabled: motionEnabled });

  return (
    <div className="portfolio-app" data-active-section={activeSection} data-bootstrap={bootstrapPhase}>
      {bootstrapPhase !== 'ready' ? (
        <PortfolioLoader
          heroImage={site.avatarPoster}
          firstMedia={newton.heroMedia}
          onReveal={revealPortfolio}
          onComplete={completeBootstrap}
        />
      ) : null}
      <div className="site" id="top">
        <GlobalNavigation name={site.name} motionReady={bootstrapPhase !== 'loading'} />

        <main id="main-content">
          <section
            className={`hero shell motion-section ${heroMotion.revealed ? 'is-revealed' : ''}`}
            id="hero"
            aria-labelledby="hero-title"
            data-motion-active={heroMotion.isActive}
            data-motion-epoch={heroMotion.epoch}
          >
            <div className="hero__identity">
              <p className="eyebrow">Portfolio / 2026</p>
              <h1 id="hero-title">{site.name}</h1>
            </div>

          <HeroAvatar
            animatedSrc={site.avatar}
            posterSrc={site.avatarPoster}
            animate={bootstrapPhase !== 'loading'}
          />

          <div className="hero__roles" aria-label="专业方向">
            {site.roles.map((role, index) => (
              <p key={role}>
                <span>0{index + 1}</span>
                <span className="hero__role-label">{role}</span>
              </p>
            ))}
          </div>

          <div className="hero__motto">
            <p className="eyebrow">Personal Motto</p>
            <p><span className="text-highlight">{site.motto}</span></p>
          </div>

          <div className="hero__practice">
            <p>{heroLeadBefore}<span className="text-highlight">{heroLeadHighlight}</span>{heroLeadAfter}</p>
            <p>{site.whatIDo.detail}</p>
          </div>

          <div className="hero__actions">
            <ArrowLink href="#selected-works">代表作品</ArrowLink>
          </div>

          </section>

        <section className="selected-works shell" id="selected-works" aria-label="代表作品">
          <header
            className={`section-intro motion-section ${selectedMotion.revealed ? 'is-revealed' : ''}`}
            id="selected-intro"
            data-motion-active={selectedMotion.isActive}
            data-motion-epoch={selectedMotion.epoch}
          >
            <p className="eyebrow">01–04 / SELECTED</p>
            <p>这几个项目做法都不太一样：有的从规则出发，有的从视觉和数据结构出发。对我来说，它们都是把一个奇怪想法一路做成能玩的东西。</p>
          </header>

          <FlagshipProject project={newton} activeSection={activeSection} />
          <SecondaryProject project={anchor} activeSection={activeSection} />
          <SecondaryProject project={crimson} activeSection={activeSection} reverse />
          <ArchiveProject project={archive} activeSection={activeSection} />
        </section>

        <section
          className={`about shell motion-section ${aboutMotion.revealed ? 'is-revealed' : ''}`}
          id="about"
          aria-labelledby="about-title"
          data-motion-active={aboutMotion.isActive}
          data-motion-epoch={aboutMotion.epoch}
        >
          <div className="about__heading">
            <p className="eyebrow">About / Contact</p>
            <h2 id="about-title">关于我</h2>
          </div>
          <div className="about__copy">
            {site.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <dl className="contact-list">
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></dd>
            </div>
          </dl>
          <div className="about__links">
            <ArrowLink href={site.contact.github} external>GitHub</ArrowLink>
            <ArrowLink href={site.contact.tapTap} external>TapTap</ArrowLink>
            <ArrowLink href={site.contact.bilibili} external>Bilibili</ArrowLink>
          </div>
        </section>
        </main>

        <footer
          className={`site-footer motion-section ${footerMotion.revealed ? 'is-revealed' : ''}`}
          id="footer"
          data-motion-active={footerMotion.isActive}
          data-motion-epoch={footerMotion.epoch}
        >
          <div className="shell site-footer__inner">
            <p>诺米Styxia / Game Design Portfolio</p>
            <p>Game Design / Visual / AI-native</p>
            <a href="#top">返回顶部 ↑</a>
          </div>
        </footer>
      </div>

      {bootstrapPhase === 'ready' ? (
        <GreenColleague
          currentSection={activeSection}
          sectionTargets={portfolioSections}
          projectAnchors={companionProjectAnchors}
        />
      ) : null}
    </div>
  );
}

export default App;
