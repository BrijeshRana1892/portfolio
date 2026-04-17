'use client';

import { useEffect, useState } from 'react';
import Preloader from '@/components/Preloader';
import ScrollProgress from '@/components/ScrollProgress';
import SmoothScroll from '@/components/SmoothScroll';
import ThemeToggle from '@/components/ThemeToggle';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Contact from '@/components/Contact';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      {!loading && (
        <>
          <ScrollProgress />
          <ThemeToggle />

          <SmoothScroll>
            <Navbar />
            <main>
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Experience />
              <Contact />
            </main>
          </SmoothScroll>
        </>
      )}
    </>
  );
}
