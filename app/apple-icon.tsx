import { ImageResponse } from 'next/og';

export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(145deg, #1a0a3e 0%, #08071a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            background: 'radial-gradient(circle, rgba(108,99,255,0.30) 0%, transparent 65%)',
            top: -20,
            left: -20,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: 60,
            background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 65%)',
            bottom: -10,
            right: -10,
          }}
        />
        {/* Border ring */}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 34,
            border: '1.5px solid rgba(108,99,255,0.25)',
          }}
        />
        {/* BR monogram */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.06em',
            display: 'flex',
          }}
        >
          <span style={{ color: '#a78bfa' }}>B</span>
          <span style={{ color: '#67e8f9' }}>R</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
