import React, { useEffect } from 'react';

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: "var(--obsidian-hi)", border: "1px solid var(--card-border)",
      color: "var(--gold)", fontFamily: "'Cinzel', serif", fontWeight: 600,
      fontSize: 13, padding: "12px 24px", borderRadius: 40,
      boxShadow: "var(--glow-gold), 0 8px 32px rgba(0,0,0,0.6)",
      zIndex: 9000, whiteSpace: "nowrap", animation: "slideIn 0.3s ease",
    }}>
      {message}
    </div>
  );
}

/** Floating +XP particle */
export function XpFloat({ xp, x, y, onDone }: { xp: number; x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="xp-float" style={{ left: x, top: y }}>
      +{xp} XP
    </div>
  );
}
