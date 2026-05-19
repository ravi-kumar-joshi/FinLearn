import { useState, useEffect } from 'react';

const LG_QUERY = '(min-width: 1024px)';

/** Dashboard sidebar: open on desktop, closed on mobile; auto-closes when viewport shrinks. */
export function useSidebarOpen() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(LG_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const onChange = (e) => {
      if (!e.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return [sidebarOpen, setSidebarOpen];
}
