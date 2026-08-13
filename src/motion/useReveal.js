import { useEffect, useRef, useState } from 'react';

export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return undefined;

    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setRevealed(true);
      observer.disconnect();
    }, { threshold, rootMargin });

    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed, rootMargin, threshold]);

  return { ref, revealed };
}
