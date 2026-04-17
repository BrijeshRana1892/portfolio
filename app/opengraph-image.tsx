import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Brijesh Rana — Software Engineer & AI/ML Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'radial-gradient(circle at 18% 22%, rgba(108,99,255,0.55) 0%, transparent 55%),' +
            'radial-gradient(circle at 85% 85%, rgba(0,212,255,0.40) 0%, transparent 55%),' +
            'linear-gradient(135deg, #06060f 0%, #0d0b20 55%, #090a1a 100%)',
          color: '#f5f5fa',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            background: 'linear-gradient(180deg, #9b8fff 0%, #00d4ff 100%)',
            display: 'flex',
          }}
        />

        {/* Top row: label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 24px #00ff88',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(240,240,245,0.65)',
              display: 'flex',
            }}
          >
            Open to Summer 2026 Internships
          </div>
        </div>

        {/* Main title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '104px',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              color: '#ffffff',
              display: 'flex',
            }}
          >
            Brijesh Rana
          </div>
          <div
            style={{
              fontSize: '46px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              background: 'linear-gradient(120deg, #9b8fff 0%, #00d4ff 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            Software Engineer · AI/ML Developer
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: 'rgba(240,240,245,0.55)',
              marginTop: '18px',
              maxWidth: '900px',
              lineHeight: 1.45,
              display: 'flex',
            }}
          >
            Building agentic systems, full-stack apps, and intelligent software. MS Computer Science @ CSULB 2026.
          </div>
        </div>

        {/* Bottom row: URL + tech */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'rgba(240,240,245,0.75)',
              fontFamily: 'monospace',
              display: 'flex',
            }}
          >
            brijeshrana.dev
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['React', 'Next.js', 'Python', 'RAG', 'LangChain'].map((t) => (
              <div
                key={t}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(108,99,255,0.18)',
                  border: '1px solid rgba(108,99,255,0.35)',
                  borderRadius: '100px',
                  fontSize: '20px',
                  fontWeight: 500,
                  color: 'rgba(240,240,245,0.82)',
                  display: 'flex',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
