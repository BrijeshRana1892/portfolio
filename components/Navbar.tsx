'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meta } from '@/lib/data';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Scrolled state
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        className={`main-nav${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      >
        {/* Logo */}
        <button
          className="nav-logo"
          onClick={() => scrollTo('#hero')}
          style={{ background: 'none', border: 'none' }}
        >
          BR<span className="nav-dot">.</span>
        </button>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              className={`nav-link${activeSection === link.href.replace('#', '') ? ' active' : ''}`}
              onClick={() => scrollTo(link.href)}
            >
              {link.label}
            </button>
          ))}

          <a
            href={meta.github}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-github"
          >
            <span className="nav-github-dot" />
            GitHub
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none' }}
        >
          <span className={`hamburger-line top${menuOpen ? ' open' : ''}`} />
          <span className={`hamburger-line mid${menuOpen ? ' open' : ''}`} />
          <span className={`hamburger-line bot${menuOpen ? ' open' : ''}`} />
        </button>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.label}
                className="mobile-nav-link"
                onClick={() => scrollTo(link.href)}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.a
              href={meta.github}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-github"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.06, duration: 0.4 }}
              style={{ alignSelf: 'flex-start', marginTop: '12px' }}
            >
              <span className="nav-github-dot" />
              GitHub
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
