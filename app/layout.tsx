import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import MagneticCursor from '@/components/MagneticCursor';
import ScrollSkew from '@/components/ScrollSkew';
import LightSpotlight from '@/components/LightSpotlight';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://brijeshrana.dev'),

  title: {
    default: 'Brijesh Rana — Software Engineer & AI/ML Developer',
    template: '%s · Brijesh Rana',
  },
  description:
    'Software Engineer & AI/ML Developer building agentic systems, full-stack applications, and intelligent software. MS Computer Science, CSULB 2026.',

  keywords: [
    'Brijesh Rana',
    'Software Engineer',
    'AI/ML Engineer',
    'Full Stack Developer',
    'Agentic AI',
    'RAG',
    'LangChain',
    'React',
    'Next.js',
    'Python',
    'FastAPI',
    'CSULB',
    'Long Beach',
    'Portfolio',
  ],

  authors: [{ name: 'Brijesh Rana', url: 'https://brijeshrana.dev' }],
  creator: 'Brijesh Rana',
  publisher: 'Brijesh Rana',
  category: 'technology',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brijeshrana.dev',
    siteName: 'Brijesh Rana',
    title: 'Brijesh Rana — Software Engineer & AI/ML Developer',
    description:
      'Building agentic systems, full-stack apps, and intelligent software. MS CS @ CSULB 2026. Open to Summer 2026 internships.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Brijesh Rana — Software Engineer & AI/ML Developer',
    description:
      'Building agentic systems, full-stack apps, and intelligent software. MS CS @ CSULB 2026.',
    creator: '@brijeshrana',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://brijeshrana.dev',
  },

  verification: {
    // Paste the content value from Google Search Console when you verify
    google: 'REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN',
  },
};

export const viewport: Viewport = {
  themeColor: '#06060f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* rel=me links for identity verification across platforms */}
        <link rel="me" href="https://github.com/brijesh-tech" />
        <link rel="me" href="https://www.linkedin.com/in/brijesh-tech/" />
        <link rel="me" href="mailto:rbrijesh1892@gmail.com" />

        {/* Apply theme before first paint to avoid flash. Default: dark. Light only if user explicitly opted in. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
        {/* JSON-LD: Person schema for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Brijesh Rana',
              url: 'https://brijeshrana.dev',
              jobTitle: 'Software Engineer & AI/ML Developer',
              description:
                'Software Engineer & AI/ML Developer building agentic systems, full-stack applications, and intelligent software.',
              email: 'rbrijesh1892@gmail.com',
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'California State University, Long Beach',
              },
              sameAs: [
                'https://github.com/brijesh-tech',
                'https://www.linkedin.com/in/brijesh-tech/',
              ],
              knowsAbout: [
                'Software Engineering',
                'Artificial Intelligence',
                'Machine Learning',
                'Agentic AI',
                'Retrieval-Augmented Generation',
                'Full-Stack Development',
                'React',
                'Next.js',
                'Python',
                'FastAPI',
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <MagneticCursor />
        <ScrollSkew />
        <LightSpotlight />
        {children}
      </body>
    </html>
  );
}
