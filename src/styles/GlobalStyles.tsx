import React from 'react';

export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Nunito:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --obsidian:     #0d0d1a;
      --obsidian-mid: #12122a;
      --obsidian-hi:  #1a1a38;
      --card:         rgba(255,255,255,0.035);
      --card-border:  rgba(240,192,64,0.15);
      --gold:         #f0c040;
      --gold-dim:     #b8902e;
      --teal:         #2de0b0;
      --teal-dim:     #1a8c6e;
      --parchment:    #e8dcc8;
      --muted:        #7a6e5e;
      --danger:       #e05555;
      --glow-gold:    0 0 20px rgba(240,192,64,0.35);
      --glow-teal:    0 0 20px rgba(45,224,176,0.35);
      --radius:       14px;
      --radius-sm:    8px;
    }

    html, body, #root {
      height: 100%;
      background: var(--obsidian);
      color: var(--parchment);
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      line-height: 1.5;
      overscroll-behavior: none;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 4px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
    @keyframes xpFloat {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      80%  { opacity: 1; transform: translateY(-36px) scale(1.1); }
      100% { opacity: 0; transform: translateY(-48px) scale(0.9); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: var(--glow-gold); }
      50%       { box-shadow: 0 0 32px rgba(240,192,64,0.6); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    @keyframes badgePop {
      0%   { transform: scale(0); }
      70%  { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-in { animation: fadeIn 0.3s ease both; }

    .gold-text {
      background: linear-gradient(135deg, #f0c040 0%, #fde89a 50%, #b8902e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .shimmer-text {
      background: linear-gradient(90deg, #f0c040 0%, #fde89a 30%, #f0c040 60%, #fde89a 90%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.5s linear infinite;
    }

    button { cursor: pointer; border: none; outline: none; font-family: 'Nunito', sans-serif; }

    input, textarea {
      font-family: 'Nunito', sans-serif;
      outline: none;
    }

    /* Noise texture overlay */
    .noise::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      border-radius: inherit;
    }

    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      position: relative;
      overflow: hidden;
    }

    .card:hover { border-color: rgba(240,192,64,0.3); }

    .btn-gold {
      background: linear-gradient(135deg, #f0c040, #b8902e);
      color: #0d0d1a;
      font-family: 'Cinzel', serif;
      font-weight: 700;
      border-radius: var(--radius-sm);
      padding: 10px 20px;
      transition: all 0.2s;
      letter-spacing: 0.04em;
    }
    .btn-gold:hover { box-shadow: var(--glow-gold); transform: translateY(-1px); }
    .btn-gold:active { transform: translateY(0); }
    .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-teal {
      background: linear-gradient(135deg, #2de0b0, #1a8c6e);
      color: #0d0d1a;
      font-family: 'Cinzel', serif;
      font-weight: 700;
      border-radius: var(--radius-sm);
      padding: 10px 20px;
      transition: all 0.2s;
      letter-spacing: 0.04em;
    }
    .btn-teal:hover { box-shadow: var(--glow-teal); transform: translateY(-1px); }
    .btn-teal:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-ghost {
      background: transparent;
      color: var(--muted);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-sm);
      padding: 10px 20px;
      transition: all 0.2s;
      font-weight: 600;
    }
    .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: var(--parchment); }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: var(--danger);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      border-radius: 10px;
      animation: badgePop 0.3s ease;
    }

    .separator {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(240,192,64,0.2), transparent);
      margin: 16px 0;
    }

    /* XP float animation */
    .xp-float {
      position: fixed;
      font-family: 'Cinzel', serif;
      font-weight: 700;
      color: var(--gold);
      font-size: 20px;
      pointer-events: none;
      z-index: 9999;
      animation: xpFloat 1.4s ease forwards;
      text-shadow: 0 0 12px rgba(240,192,64,0.8);
    }
  `}</style>
);
