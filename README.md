# Brijesh Rana — Portfolio

Personal portfolio site built with Next.js 14, React Three Fiber, GSAP, and Framer Motion.

Live: _coming soon_

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| 3D Graphics | React Three Fiber + Three.js |
| Animation | Framer Motion + GSAP + Lenis |
| Styling | CSS-in-JS (inline) + globals.css |
| State | Zustand |
| Deployment | Vercel |

---

## Features

- Full-viewport WebGL background with animated star field and peripheral shapes
- Wireframe icosahedron focal piece with 4 orbiting particles and mouse parallax
- Smooth scroll driven by Lenis
- Typewriter role cycle with per-character color theming
- Light / dark mode with persistent preference and no flash on load
- Light mode: animated gradient blobs on `html` root, dot grid overlay, glass cards
- Experience timeline: minimal cards (no bullet points), tech pill tags
- About section: satellite-orbiting skill pills with CSS transform animation, 3D tilt card
- Animated stat counters triggered on scroll entry
- Skills marquee with three independent rows
- Contact section with copy-to-clipboard email and animated word entrance
- Film grain overlay (dark mode only)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  layout.tsx        # Root layout + SEO metadata
  page.tsx          # Single-page composition
  globals.css       # CSS variables, dark/light themes, keyframes

components/
  Hero.tsx          # Hero section with typewriter + CTA
  About.tsx         # About section with avatar card + stats
  Experience.tsx    # Work / education timeline
  Skills.tsx        # Marquee skill rows + category grid
  Projects.tsx      # Project cards
  Contact.tsx       # Contact section with social links
  Navbar.tsx        # Top navigation with theme toggle
  three/
    HeroScene.tsx   # Full-viewport R3F background
    FocalShape.tsx  # Icosahedron accent shape (right column)

lib/
  data.ts           # All portfolio content (single source of truth)
```

---

## Content

All text, project data, skills, and links live in [lib/data.ts](lib/data.ts). Edit that file to update the portfolio content without touching component logic.

---

## License

MIT
