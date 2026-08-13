import { GlobalNavigation } from './components/GlobalNavigation.jsx';
import { MediaFigure } from './components/MediaFigure.jsx';
import { projects } from './data/projects.js';
import { site } from './data/site.js';

const externalProps = {
  target: '_blank',
  rel: 'noreferrer',
};

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
          TapTap
        </ArrowLink>
      ) : null}
    </div>
  );
}

function FlagshipProject({ project }) {
  return (
    <article className="project project--flagship" id={project.id} style={{ '--project-accent': project.accent }}>
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

function SecondaryProject({ project, reverse = false }) {
  const hasDesignNote = project.id === 'anchor-maze' || project.id === 'crimson-leap';

  return (
    <article
      className={`project project--secondary ${project.id === 'anchor-maze' ? 'project--anchor' : ''} ${project.id === 'crimson-leap' ? 'project--crimson' : ''} ${reverse ? 'project--reverse' : ''}`}
      id={project.id}
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

function ArchiveProject({ project }) {
  return (
    <article className="project project--archive" id={project.id} style={{ '--project-accent': project.accent }}>
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
          <p>{project.summary}</p>
          <ProjectMeta project={project} />
          <ul className="archive-list">
            {project.contributions.map((contribution) => (
              <li key={contribution}>{contribution}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [newton, anchor, crimson, archive] = projects;

  return (
    <div className="site" id="top">
      <GlobalNavigation name={site.name} />

      <main id="main-content">
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero__identity">
            <p className="eyebrow">Portfolio / 2026</p>
            <h1 id="hero-title">{site.name}</h1>
          </div>

          <img
            className="hero__avatar"
            src={site.avatar}
            alt="诺米Styxia 蓝白角色创作者头像"
            width="800"
            height="800"
            decoding="async"
          />

          <div className="hero__roles" aria-label="专业方向">
            {site.roles.map((role, index) => (
              <p key={role}>
                <span>0{index + 1}</span>
                {role}
              </p>
            ))}
          </div>

          <div className="hero__motto">
            <p className="eyebrow">Personal Motto</p>
            <p>{site.motto}</p>
          </div>

          <div className="hero__practice">
            <p>{site.whatIDo.lead}</p>
            <p>{site.whatIDo.detail}</p>
          </div>

          <div className="hero__actions">
            <ArrowLink href="#selected-works">代表作品</ArrowLink>
          </div>

        </section>

        <section className="selected-works shell" id="selected-works" aria-label="代表作品">
          <header className="section-intro">
            <p className="eyebrow">01–04 / SELECTED</p>
            <p>这几个项目做法都不太一样：有的从规则出发，有的从视觉和数据结构出发。对我来说，它们都是把一个奇怪想法一路做成能玩的东西。</p>
          </header>

          <FlagshipProject project={newton} />
          <SecondaryProject project={anchor} />
          <SecondaryProject project={crimson} reverse />
          <ArchiveProject project={archive} />
        </section>

        <section className="about shell" id="about" aria-labelledby="about-title">
          <div className="about__heading">
            <p className="eyebrow">About / Contact</p>
            <h2 id="about-title">关于</h2>
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

      <footer className="site-footer">
        <div className="shell site-footer__inner">
          <p>诺米Styxia / Game Design Portfolio</p>
          <p>Games / Tools / AI-native workflows</p>
          <a href="#top">返回顶部 ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
