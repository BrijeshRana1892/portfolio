import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
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
  title: 'Brijesh Rana — Software Engineer & AI/ML Developer',
  description:
    "Portfolio of Brijesh Rana — CS Master's student at CSULB building intelligent full-stack systems with React, Python, and AI/ML.",
  keywords: [
    'Software Engineer',
    'Full Stack Developer',
    'React',
    'Python',
    'AI',
    'Machine Learning',
    'Next.js',
    'CSULB',
  ],
  authors: [{ name: 'Brijesh Rana' }],
  openGraph: {
    title: 'Brijesh Rana — Software Engineer & AI/ML Developer',
    description:
      "Portfolio of Brijesh Rana — CS Master's student at CSULB building intelligent full-stack systems.",
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
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
        {/* Apply theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}else if(!t&&window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
