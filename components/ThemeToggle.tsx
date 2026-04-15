'use client';

import { useEffect, useRef, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsDark(!document.documentElement.classList.contains('light'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const toggle = (e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const size = Math.hypot(window.innerWidth, window.innerHeight) * 2.2;

    const ripple = rippleRef.current;
    if (ripple) {
      const nextIsDark = document.documentElement.classList.contains('light');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.background = nextIsDark ? '#06060f' : '#f0eeff';
      ripple.style.transform = 'translate(-50%,-50%) scale(0)';
      ripple.style.transition = 'none';

      // Force reflow
      void ripple.offsetWidth;

      ripple.style.transition = 'transform 0.7s cubic-bezier(0.4,0,0.2,1)';
      ripple.style.transform = 'translate(-50%,-50%) scale(1)';

      setTimeout(() => {
        document.documentElement.classList.toggle('light');
        const newDark = !document.documentElement.classList.contains('light');
        setIsDark(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');

        ripple.style.transition = 'none';
        ripple.style.transform = 'translate(-50%,-50%) scale(0)';
      }, 680);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Ripple overlay */}
      <div
        ref={rippleRef}
        style={{
          position: 'fixed',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99996,
          transform: 'translate(-50%,-50%) scale(0)',
        }}
      />

      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Sun / Moon icon morphs */}
        {isDark ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.8}>
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>
    </>
  );
}
