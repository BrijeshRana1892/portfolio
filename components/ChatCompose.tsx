'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meta } from '@/lib/data';

type Intent = 'hiring' | 'collab' | 'question' | 'hi';

const INTENTS: { id: Intent; label: string; emoji: string; subject: string; prompt: string }[] = [
  { id: 'hiring',   label: 'Hiring',          emoji: '💼', subject: 'Opportunity',    prompt: 'Tell me about the role — company, team, and what you’re building.' },
  { id: 'collab',   label: 'Collaboration',   emoji: '🤝', subject: 'Collaboration',  prompt: 'What are we building together? Rough scope + timeline helps.' },
  { id: 'question', label: 'Quick question',  emoji: '❓', subject: 'Quick question', prompt: 'Shoot. I’ll try to reply within a day.' },
  { id: 'hi',       label: 'Just saying hi',  emoji: '👋', subject: 'Hello',          prompt: 'Love that. Where are you from, and what caught your eye?' },
];

export default function ChatCompose({ isDark }: { isDark: boolean }) {
  const [intent, setIntent] = useState<Intent | null>(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const picked = INTENTS.find((i) => i.id === intent);

  useEffect(() => {
    if (!intent) return;
    setTyping(true);
    setShowPrompt(false);
    const t = setTimeout(() => {
      setTyping(false);
      setShowPrompt(true);
      setTimeout(() => msgRef.current?.focus(), 200);
    }, 900);
    return () => clearTimeout(t);
  }, [intent]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [intent, typing, showPrompt]);

  const canSend = intent && msg.trim().length >= 3;

  const handleSend = () => {
    if (!canSend || !picked) return;
    const subject = `${picked.subject}${name.trim() ? ` — from ${name.trim()}` : ''}`;
    const body = `${msg.trim()}\n\n—${name.trim() || 'Sent from brijeshrana.dev'}`;
    const href = `mailto:${meta.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const bubbleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(12,11,29,0.05)';
  const bubbleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(91,76,255,0.12)';
  const youBg = isDark
    ? 'linear-gradient(135deg, #6c63ff, #00d4ff)'
    : 'linear-gradient(135deg, #5b4cff, #0891b2)';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto 48px',
        background: isDark ? 'rgba(10,10,22,0.55)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${bubbleBorder}`,
        borderRadius: '20px',
        backdropFilter: 'blur(18px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
        boxShadow: isDark
          ? '0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(108,99,255,0.08) inset'
          : '0 16px 48px rgba(91,76,255,0.16), 0 6px 16px rgba(8,145,178,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Header — iMessage style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px',
        borderBottom: `1px solid ${bubbleBorder}`,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
          color: '#fff',
          boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
        }}>BR</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
            color: 'var(--text)', letterSpacing: '-0.01em',
          }}>Brijesh Rana</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-body)', fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#00ff88', boxShadow: '0 0 6px rgba(0,255,136,0.8)',
            }} />
            Online · usually replies within a day
          </div>
        </div>
      </div>

      {/* Thread */}
      <div
        ref={scrollRef}
        style={{
          minHeight: '260px',
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '18px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}
      >
        {/* Greeting bubble */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            alignSelf: 'flex-start',
            maxWidth: '78%',
            padding: '10px 14px',
            background: bubbleBg,
            border: `1px solid ${bubbleBorder}`,
            borderRadius: '16px 16px 16px 4px',
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.5,
          }}
        >
          Hey — glad you made it this far. What brings you to my site?
        </motion.div>

        {/* Intent pills or selected bubble */}
        <AnimatePresence mode="wait">
          {!intent ? (
            <motion.div
              key="pills"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.25, duration: 0.35 }}
              style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                padding: '4px 0 2px 2px',
              }}
            >
              {INTENTS.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setIntent(it.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px',
                    background: isDark ? 'rgba(108,99,255,0.12)' : 'rgba(91,76,255,0.08)',
                    border: `1px solid ${isDark ? 'rgba(108,99,255,0.28)' : 'rgba(91,76,255,0.22)'}`,
                    borderRadius: '100px',
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = isDark ? 'rgba(108,99,255,0.2)' : 'rgba(91,76,255,0.14)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = isDark ? 'rgba(108,99,255,0.12)' : 'rgba(91,76,255,0.08)';
                  }}
                >
                  <span>{it.emoji}</span>
                  <span>{it.label}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="chosen"
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={{
                alignSelf: 'flex-end',
                maxWidth: '78%',
                padding: '10px 14px',
                background: youBg,
                borderRadius: '16px 16px 4px 16px',
                fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500,
                color: '#fff',
                boxShadow: '0 6px 18px rgba(108,99,255,0.3)',
              }}
            >
              {picked?.emoji} {picked?.label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                alignSelf: 'flex-start',
                padding: '12px 16px',
                background: bubbleBg,
                border: `1px solid ${bubbleBorder}`,
                borderRadius: '16px 16px 16px 4px',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--text-muted)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assistant follow-up prompt */}
        <AnimatePresence>
          {showPrompt && picked && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                alignSelf: 'flex-start',
                maxWidth: '78%',
                padding: '10px 14px',
                background: bubbleBg,
                border: `1px solid ${bubbleBorder}`,
                borderRadius: '16px 16px 16px 4px',
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'var(--text)',
                lineHeight: 1.5,
              }}
            >
              {picked.prompt}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div style={{
        padding: '12px 14px',
        borderTop: `1px solid ${bubbleBorder}`,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          style={{
            width: '100%',
            padding: '9px 14px',
            background: 'transparent',
            border: `1px solid ${bubbleBorder}`,
            borderRadius: '10px',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = bubbleBorder; }}
        />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <textarea
            ref={msgRef}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={intent ? 'Type your message…' : 'Pick a topic above to start'}
            rows={2}
            disabled={!intent}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'transparent',
              border: `1px solid ${bubbleBorder}`,
              borderRadius: '12px',
              fontFamily: 'var(--font-body)', fontSize: '14px',
              color: 'var(--text)',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              minHeight: '44px',
              opacity: intent ? 1 : 0.6,
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = bubbleBorder; }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: 'none',
              background: canSend ? youBg : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(12,11,29,0.08)'),
              color: canSend ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: canSend ? '0 6px 18px rgba(108,99,255,0.4)' : 'none',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10.5px',
          color: 'var(--text-muted)', opacity: 0.7,
          textAlign: 'right', paddingRight: '4px',
          letterSpacing: '0.04em',
        }}>
          opens your mail client · ⌘/Ctrl + Enter to send
        </div>
      </div>
    </div>
  );
}
