import { useEffect, useState } from 'react';

const navigationItems = [
  { label: 'Selected Works', href: '#selected-works' },
  { label: 'Tools', href: '#tools' },
  { label: 'About', href: '#about' },
];

export function GlobalNavigation({ name }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <header className="site-header">
      <nav className="shell site-nav" aria-label="主导航">
        <a className="site-mark" href="#top" onClick={() => setIsOpen(false)}>
          <span aria-hidden="true">NS</span>
          <span className="site-mark__name">{name}</span>
        </a>

        <div className="site-nav__desktop">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <button
          className="menu-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span>{isOpen ? 'Close' : 'Menu'}</span>
          <span className="menu-button__icon" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>

        <div
          className={`site-nav__mobile ${isOpen ? 'is-open' : ''}`}
          id="mobile-navigation"
          aria-hidden={!isOpen}
        >
          {navigationItems.map((item, index) => (
            <a key={item.href} href={item.href} onClick={() => setIsOpen(false)} tabIndex={isOpen ? 0 : -1}>
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
