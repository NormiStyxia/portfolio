export function SectionPlaceholder({ eyebrow, title, description }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/55 p-6 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl text-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
    </section>
  );
}
