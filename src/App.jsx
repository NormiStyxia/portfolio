import { GlobalNavigation } from './components/GlobalNavigation.jsx';
import { MediaFigure } from './components/MediaFigure.jsx';
import { projects, tools } from './data/projects.js';
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
  return (
    <dl className="project-meta">
      <div>
        <dt>Role</dt>
        <dd>{project.role.join(' / ')}</dd>
      </div>
      <div>
        <dt>Duration</dt>
        <dd>{project.duration}</dd>
      </div>
      <div>
        <dt>Context</dt>
        <dd>{project.platform || project.year}</dd>
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
      {project.links.caseStudy ? <ArrowLink href={project.links.caseStudy}>Case Study</ArrowLink> : null}
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

      <ProjectMeta project={project} />
      <MediaFigure media={project.heroMedia} className="project-media project-media--flagship" />

      <div className="project-evidence">
        <p>{project.summary}</p>
        <ol>
          {project.contributions.map((contribution) => (
            <li key={contribution}>{contribution}</li>
          ))}
        </ol>
        <ProjectLinks project={project} />
      </div>
    </article>
  );
}

function SecondaryProject({ project, reverse = false }) {
  return (
    <article
      className={`project project--secondary ${reverse ? 'project--reverse' : ''}`}
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
          <ul className="contribution-list">
            {project.contributions.map((contribution) => (
              <li key={contribution}>{contribution}</li>
            ))}
          </ul>
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
            alt="NormiStyxia 蓝白角色创作者头像"
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
            <ArrowLink href="#selected-works">Selected Works</ArrowLink>
          </div>

          <div className="hero__socials" aria-label="外部链接">
            <ArrowLink href={site.contact.github} external>GitHub</ArrowLink>
            <ArrowLink href={site.contact.tapTap} external>TapTap</ArrowLink>
            <ArrowLink href={`mailto:${site.contact.email}`}>Contact</ArrowLink>
          </div>

        </section>

        <section className="selected-works shell" id="selected-works" aria-labelledby="selected-title">
          <header className="section-intro">
            <p className="eyebrow">01—04 / Selected</p>
            <h2 id="selected-title">Selected Works</h2>
            <p>四个不等权项目，分别证明规则设计、AI-native 系统、视觉技术统一与能力演化。</p>
          </header>

          <FlagshipProject project={newton} />
          <SecondaryProject project={anchor} />
          <SecondaryProject project={crimson} reverse />
          <ArchiveProject project={archive} />
        </section>

        <section className="tools-section" id="tools" aria-labelledby="tools-title">
          <div className="shell">
            <header className="section-intro section-intro--tools">
              <p className="eyebrow">Infrastructure / Cross-project</p>
              <h2 id="tools-title">Tools &amp; Workflow</h2>
              <p>The infrastructure behind the games.</p>
            </header>

            <div className="tools-list">
              {tools.map((tool) => (
                <article className="tool-row" key={tool.index}>
                  <span className="tool-row__index">{tool.index}</span>
                  <h3>{tool.title}</h3>
                  <p>{tool.detail}</p>
                  <p className="tool-row__used">
                    <span>Used in</span>
                    {tool.usedIn}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about shell" id="about" aria-labelledby="about-title">
          <div className="about__heading">
            <p className="eyebrow">About / Contact</p>
            <h2 id="about-title">Make the rules.<br />Build the tools.</h2>
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
          <p>NormiStyxia / Game Design Portfolio</p>
          <p>Games / Tools / AI-native workflows</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
