export function SiteHeader({ name }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-mist/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <a className="card-title text-ink" href="#top">
          {name}
        </a>
        <div className="nav-text hidden items-center gap-5 text-muted sm:flex">
          <a href="#project">核心项目</a>
          <a href="#tools-editor">辅助工具</a>
          <a href="#gallery">美术素材</a>
          <a href="#process">项目演化</a>
          <a href="#contact">联系方式</a>
        </div>
      </nav>
    </header>
  );
}
