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
  linkedin: 'https://www.linkedin.com/in/brijesh-tech/',
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
  { name: 'Java', color: '#f89820' },
  { name: 'Python', color: '#3776ab' },
  { name: 'JavaScript', color: '#f7df1e' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'C++', color: '#00599c' },
  { name: 'SQL', color: '#336791' },
  { name: 'Shell Scripting', color: '#89e051' },
  { name: 'React', color: '#61dafb' },
];
export const skillsRow2 = [
  { name: 'Spring Boot', color: '#6db33f' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Express.js', color: '#ffffff' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MySQL', color: '#4479a1' },
  { name: 'MongoDB', color: '#47a248' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'REST APIs', color: '#ff6b35' },
];
export const skillsRow3 = [
  { name: 'LangChain', color: '#1c7a4a' },
  { name: 'OpenAI API', color: '#10a37f' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'Kubernetes', color: '#326ce5' },
  { name: 'AWS', color: '#ff9900' },
  { name: 'CI/CD', color: '#f05032' },
  { name: 'Linux', color: '#fcc624' },
  { name: 'Git', color: '#f05032' },
];

// ── Skill categories (3×2 grid) ──────────────────────
export const skillCategories = [
  {
    title: 'Languages',
    color: '#00d4ff',
    skills: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C', 'SQL', 'Shell Scripting'],
  },
  {
    title: 'Backend',
    color: '#4ade80',
    skills: ['Spring Boot', 'Node.js', 'Express.js', 'REST APIs', 'Microservices'],
  },
  {
    title: 'AI/ML',
    color: '#a855f7',
    skills: ['LangChain', 'OpenAI API', 'RAG', 'GenAI', 'LLMs', 'Pinecone'],
  },
  {
    title: 'Database',
    color: '#22d3ee',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  },
  {
    title: 'Cloud & DevOps',
    color: '#fb923c',
    skills: ['AWS (S3, Lambda)', 'Docker', 'Kubernetes', 'CI/CD', 'Linux/Unix', 'Git'],
  },
  {
    title: 'Frontend',
    color: '#f472b6',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Three.js', 'Framer Motion'],
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
    caseStudy: {
      role: 'Solo build — full stack, ML pipeline, infra',
      timeline: '8 weeks · 2024',
      problem:
        'Traditional AI code review tools treat every file in isolation. They flag syntax issues but miss the repository\'s conventions, miss how helper functions are actually used across modules, and miss the domain language of the codebase. Reviewers were getting noise — style nits that ignored the project\'s real idioms.',
      approach: [
        'Built a retrieval layer over each repository: chunk files on syntactic boundaries (functions, classes, blocks), embed with OpenAI ada-002, index in Pinecone.',
        'On every review request, pull the diff, retrieve the top-K semantically related chunks from the repo, and pass them as context alongside the diff to GPT-4.',
        'Added a Redis cache keyed by (file-hash, prompt-hash) so repeat reviews on the same commit skip the LLM call entirely.',
        'Wrapped the GitHub webhook flow so reviews run automatically on every PR open and re-run on force-push.',
      ],
      architecture: [
        { label: 'Frontend', value: 'React + Vite, GitHub OAuth for repo access' },
        { label: 'API', value: 'Node.js + Express — PR webhooks, review orchestration' },
        { label: 'Retrieval', value: 'LangChain pipeline, Pinecone vector store' },
        { label: 'LLM', value: 'OpenAI GPT-4 with structured output for file-level suggestions' },
        { label: 'Cache', value: 'Redis — cuts repeat-review latency by 60%+' },
        { label: 'Infra', value: 'Docker Compose locally, deployable container per service' },
      ],
      challenges: [
        'Token budget: large diffs blow past context windows. Solved by diff-chunking + ranking retrieved context by cosine similarity, dropping low-scoring chunks.',
        'False positives on intentional patterns: the model kept flagging codebase-specific idioms. Fixed by including a conventions summary retrieved from the README + top-level docs in every prompt.',
        'Webhook duplication: force-pushes triggered duplicate reviews. Added a request dedupe layer on (repo, PR, head-sha).',
      ],
      outcomes: [
        'Review turnaround under 40 seconds on diffs up to ~400 LoC.',
        'Cache layer reduced redundant LLM spend by 60% across repeat pushes on the same PR.',
        'Shipped context-aware suggestions that explicitly referenced other files in the repo — the differentiator vs generic linters.',
      ],
      learnings:
        'RAG quality lives and dies on the chunking strategy. My first pass chunked by fixed line count and retrieval quality was noisy; switching to AST-aware chunking made retrieved context dramatically more relevant. The second biggest win was the cache layer — it didn\'t just save money, it made the product feel snappy enough to use on every commit.',
    },
  },
  {
    id: 2,
    title: 'Codetique',
    slug: 'codetique',
    year: '2024',
    oneLiner: 'Interactive pair programming platform with real-time collaboration',
    description:
      'A browser-native pair programming platform with real-time collaboration, code sharing, chat, and file downloads — edits propagate in under 50ms via Socket.io for low-latency sync. Docker + Kubernetes handle scalable deployment, and the intuitive UI supports simultaneous multi-user editing sessions without context-switching across separate tools.',
    achievement: 'Real-time Sync < 50ms',
    tech: ['React.js', 'Tailwind', 'Socket.io', 'Docker', 'Kubernetes', 'Node.js', 'Express.js', 'Vite'],
    color: '#a855f7',
    gradientFrom: '#6c63ff',
    gradientTo: '#a855f7',
    github: 'https://github.com/brijesh-tech',
    demo: 'https://codetique-brown.vercel.app',
    caseStudy: null,
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
    caseStudy: null,
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
    caseStudy: null,
  },
];

// ── Experience ───────────────────────────────────────
export const experiences = [
  {
    company: 'Associated Students Inc., CSULB',
    role: 'Software Engineer',
    location: 'Long Beach, CA',
    period: 'May 2025 — Present',
    color: '#00d4ff',
    bullets: [
      'Designed and built a scalable file storage microservice using Node.js and AWS S3, handling document uploads, caching, and delivery for 10K+ campus users while cutting external hosting costs.',
      'Built a Python-based monitoring dashboard to track system queries and surface usage patterns across 1K+ sessions, helping teams troubleshoot bottlenecks and resolve production issues faster.',
      'Developed a retrieval-augmented Q&A pipeline using Python and LangChain to automate information lookup from institutional knowledge bases, improving response accuracy for student-facing support teams.',
      'Integrated GenAI-powered LLM APIs into internal campus tools to automate document summarization and data retrieval, writing clean, maintainable code with technical documentation for each module.',
    ],
    tech: ['Node.js', 'AWS S3', 'Python', 'LangChain', 'GenAI', 'LLMs'],
  },
  {
    company: 'Zluck Solutions',
    role: 'Software Engineer',
    location: 'Surat, India',
    period: 'Jun 2023 — Jan 2025',
    color: '#6c63ff',
    bullets: [
      'Developed 10+ production backend services in Java and Spring Boot with PostgreSQL, following object-oriented design patterns for order management and authentication, used daily by 3+ client teams.',
      'Built CI/CD pipelines with automated tests and deployment gates, participating in code reviews across the SDLC, shortening feedback cycles from 2 days to same-day merges.',
      'Designed fault-tolerant file processing services on AWS with structured logging and configurable retries, running performance analysis on distributed batch workflows to achieve 99.2% job completion reliability.',
      'Wrote and maintained unit tests across shared service modules, collaborating with cross-functional teams in an Agile environment to reduce regression defects and ensure code quality.',
    ],
    tech: ['Java', 'Spring Boot', 'PostgreSQL', 'AWS', 'CI/CD', 'Docker'],
  },
  {
    company: 'Crest Data Systems',
    role: 'Software Engineering Intern',
    location: 'Ahmedabad, India',
    period: 'Dec 2022 — May 2023',
    color: '#a855f7',
    bullets: [
      'Improved a C-based log parser on Linux by diagnosing and troubleshooting 8+ edge cases, adding unit tests for each fix and enabling faster crash reproduction, cutting intermittent failure debug time.',
      'Automated data validation using Python and shell scripts to compare file headers, row counts, and data integrity checks, reducing nightly verification time by 40 minutes for the analytics team.',
    ],
    tech: ['C', 'Python', 'Shell Scripting', 'Linux', 'Unit Testing'],
  },
];

export const education = [
  {
    institution: 'California State University, Long Beach',
    degree: 'MS in Computer Science',
    period: 'Jan 2025 — Dec 2026',
    location: 'Long Beach, CA',
    gpa: '3.7',
    focus: 'Algorithms, AI, Distributed Computing, Software Engineering',
    color: '#38bdf8',
  },
  {
    institution: 'Charotar University of Science and Technology',
    degree: 'BTech in Computer Science & Engineering',
    period: 'Jun 2019 — May 2023',
    location: 'Changa, India',
    gpa: '3.6',
    focus: 'DSA, OS, DBMS, Machine Learning & Data Analytics',
    color: '#6c63ff',
  },
];
