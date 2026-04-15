// ──────────────────────────────────────────────────────
//  ALL PORTFOLIO CONTENT — single source of truth
// ──────────────────────────────────────────────────────

export const meta = {
  name: 'Brijesh Rana',
  title: 'Brijesh Rana — Software Engineer & AI/ML Developer',
  description:
    'Brijesh Rana — Software Engineer & AI/ML Developer building agentic systems, full-stack applications, and intelligent software. MS Computer Science, CSULB 2026.',
  email: 'rbrijesh1892@gmail.com',
  github: 'https://github.com/BrijeshRana1892',
  linkedin: 'https://www.linkedin.com/in/brijesh-tech/', // TODO: replace with actual LinkedIn URL
  location: 'Long Beach, CA',
  status: 'Available for Summer 2026 Internship',
};

export const roles = [
  'Software Engineer',
  'AI/ML Engineer',
  'Full Stack Builder',
  'Agentic Systems Dev',
  'CS @ CSULB \'26',
];

export const tagline =
  'Building intelligent agentic systems at the intersection of performance, autonomy, and elegance.';

// ── About stats ─────────────────────────────────────
export const stats = [
  { value: '2+', label: 'Years Experience' },
  { value: '15+', label: 'Projects Built' },
  { value: '10K+', label: 'Lines of Code' },
  { value: '99.2%', label: 'Uptime Record' },
];

// ── Skill badges ─────────────────────────────────────
export const aboutSkills = [
  'React', 'Python', 'TypeScript', 'Next.js', 'PyTorch', 'Node.js', 'AWS', 'Docker',
];

// ── Skills marquee rows ──────────────────────────────
export const skillsRow1 = [
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Tailwind CSS', color: '#06b6d4' },
  { name: 'Three.js', color: '#049ef4' },
  { name: 'Framer Motion', color: '#ff0055' },
  { name: 'HTML5', color: '#e34f26' },
  { name: 'CSS3', color: '#264de4' },
];
export const skillsRow2 = [
  { name: 'Python', color: '#3776ab' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'FastAPI', color: '#009688' },
  { name: 'Express', color: '#ffffff' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MongoDB', color: '#47a248' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'Pinecone', color: '#00d4a1' },
];
export const skillsRow3 = [
  { name: 'PyTorch', color: '#ee4c2c' },
  { name: 'TensorFlow', color: '#ff6f00' },
  { name: 'LangChain', color: '#1c7a4a' },
  { name: 'OpenAI API', color: '#10a37f' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'Git', color: '#f05032' },
  { name: 'Figma', color: '#f24e1e' },
];

// ── Skill categories (3×2 grid) ──────────────────────
export const skillCategories = [
  {
    title: 'Frontend',
    color: '#00d4ff',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js', 'Framer Motion'],
  },
  {
    title: 'Backend',
    color: '#4ade80',
    skills: ['Python', 'Node.js', 'FastAPI', 'Express'],
  },
  {
    title: 'AI/ML',
    color: '#a855f7',
    skills: ['PyTorch', 'TensorFlow', 'LangChain', 'OpenAI API', 'Agentic AI', 'RAG', 'Multimodal AI', 'Prompt Engineering'],
  },
  {
    title: 'Database',
    color: '#22d3ee',
    skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Pinecone'],
  },
  {
    title: 'DevOps',
    color: '#fb923c',
    skills: ['Docker', 'AWS', 'Vercel', 'GitHub Actions'],
  },
  {
    title: 'Tools',
    color: '#f472b6',
    skills: ['Git', 'VS Code', 'Figma', 'Postman'],
  },
];

// ── Projects ─────────────────────────────────────────
export const projects = [
  {
    id: 1,
    title: 'AI-Powered Code Review Tool',
    slug: 'ai-code-review',
    year: '2024',
    oneLiner: 'Context-aware code review powered by RAG and GitHub integration',
    description:
      'A full-stack code review platform that integrates with the GitHub API to pull repositories and analyze code quality using OpenAI API with a RAG pipeline backed by Pinecone — surfacing context-aware, file-level suggestions in real time. Redis caching eliminates redundant API calls across repeated reviews, and the entire application is Dockerized for consistent local-to-production deployment.',
    achievement: 'Context-aware AI Review',
    tech: ['React', 'Node.js', 'LangChain', 'RAG', 'OpenAI API', 'Pinecone', 'GitHub API', 'Redis', 'Docker'],
    color: '#00d4ff',
    gradientFrom: '#0066ff',
    gradientTo: '#00d4ff',
    github: 'https://github.com/BrijeshRana1892',
    demo: null,
  },
  {
    id: 2,
    title: 'Codetique',
    slug: 'codetique',
    year: '2024',
    oneLiner: 'Live collaborative code editor with zero-latency sync',
    description:
      'A browser-native pair programming environment where two developers share a single live session — edits, cursor positions, and selections propagate in under 50ms via a WebSocket-backed CRDT layer. Powered by Monaco Editor with full LSP hints, syntax highlighting, and a sandboxed execution runtime so teams can run and test code without leaving the tab.',
    achievement: 'Real-time Sync < 50ms',
    tech: ['React', 'WebSockets', 'Node.js', 'Monaco Editor'],
    color: '#a855f7',
    gradientFrom: '#6c63ff',
    gradientTo: '#a855f7',
    github: 'https://github.com/BrijeshRana1892',
    demo: 'https://codetique-brown.vercel.app',
  },
  {
    id: 3,
    title: 'Campus AI Dashboard',
    slug: 'campus-ai',
    year: '2024',
    oneLiner: 'ML-powered analytics that surfaces campus resource signals',
    description:
      'A full-stack intelligence layer for university operations — ingesting scheduling, foot-traffic, and utilization data into a Python ML pipeline that forecasts demand and surfaces anomalies before they become problems. The React dashboard gives administrators interactive drill-downs, trend overlays, and exportable reports backed by a FastAPI data service.',
    achievement: 'ML-Powered Insights',
    tech: ['React', 'Python', 'FastAPI', 'ML Models', 'Data Viz'],
    color: '#4ade80',
    gradientFrom: '#059669',
    gradientTo: '#4ade80',
    github: 'https://github.com/BrijeshRana1892',
    demo: null,
  },
  {
    id: 4,
    title: 'Digital Flipbook Platform',
    slug: 'flipbook',
    year: '2024',
    oneLiner: 'Static content transformed into cinematic digital publications',
    description:
      'A publishing platform that breathes life into PDFs and static layouts — turning them into richly animated digital flipbooks with GPU-accelerated page-curl physics rendered on Canvas. Readers get bookmarking, deep-link sharing, and a responsive layout that adapts from mobile to widescreen, while publishers see per-page engagement analytics through a Node.js event pipeline.',
    achievement: 'Interactive Publishing',
    tech: ['React', 'Canvas API', 'Node.js', 'WebGL'],
    color: '#fb923c',
    gradientFrom: '#d97706',
    gradientTo: '#fb923c',
    github: 'https://github.com/BrijeshRana1892',
    demo: 'https://flipbook.vercel.app',
  },
];

// ── Experience ───────────────────────────────────────
export const experiences = [
  {
    company: 'Associated Students Inc., CSULB',
    role: 'Software Engineer',
    location: 'Long Beach, CA',
    period: '2025 — Present',
    color: '#00d4ff',
    bullets: [
      'Building and maintaining web infrastructure for student media and campus organizations',
      'Leading the 22 West Media website redesign using React with modern UI/UX practices',
      'Collaborating with cross-functional teams on digital solutions for 30,000+ students',
    ],
    tech: ['React', 'Node.js', 'LangChain', 'OpenAI', 'AWS'],
  },
  {
    company: 'Zluck Solutions',
    role: 'Software Engineer',
    location: 'India',
    period: '2022 — 2023',
    color: '#6c63ff',
    bullets: [
      'Developed and shipped full-stack web applications for enterprise clients',
      'Built RESTful APIs and integrated third-party services across multiple projects',
      'Collaborated with design and QA teams in an agile development environment',
    ],
    tech: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
  },
  {
    company: 'Crest Data Systems',
    role: 'Software Engineering Intern',
    location: 'India',
    period: '2021 — 2022',
    color: '#a855f7',
    bullets: [
      'Contributed to production-grade software solutions for data platform clients',
      'Gained hands-on experience with cloud services and CI/CD pipelines',
      'Participated in code reviews and sprint ceremonies as part of an engineering team',
    ],
    tech: ['Python', 'AWS', 'Docker', 'Git'],
  },
];

export const education = [
  {
    institution: 'California State University, Long Beach',
    degree: 'MS in Computer Science',
    period: 'Expected Dec 2026',
    location: 'Long Beach, CA',
    focus: 'AI/ML, Advanced Systems',
    color: '#38bdf8',
  },
  {
    institution: 'Charotar University of Science and Technology',  // TODO: replace with actual institution
    degree: 'BE in Computer Science & Engineering',
    period: 'Graduated 2023',
    location: 'India',
    focus: 'Software Engineering',
    color: '#6c63ff',
  },
];
