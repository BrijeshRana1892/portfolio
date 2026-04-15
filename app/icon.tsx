import { ImageResponse } from 'next/og';

export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(145deg, #1a0a3e 0%, #08071a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: 12,
            background: 'radial-gradient(circle, rgba(108,99,255,0.45) 0%, transparent 70%)',
            top: -4,
            left: -4,
          }}
        />
        {/* BR monogram */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: '#ffffff',
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
