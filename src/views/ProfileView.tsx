import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { XpBadge } from '../components/Common';

/**
 * The ProfileView displays the user's progress, including level, XP, and stats.
 */
export function ProfileView({ currentUser, onXpGain }: { currentUser: User; onXpGain: (xp: number, x: number, y: number) => void }) {
  const [xp, setXp] = useState(currentUser.xp);
  const [displayXp, setDisplayXp] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval>>();

  // Animate the XP counter from 0 to the target value when the component mounts or XP changes.
  useEffect(() => {
    let current = 0;
    const target = xp;
    const step = Math.ceil(target / 60);
    animRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayXp(current);
      if (current >= target) clearInterval(animRef.current);
    }, 16);
    return () => clearInterval(animRef.current);
  }, [xp]);

  // Calculate level based on XP (500 XP per level)
  const level = Math.floor(xp / 500) + 1;
  const xpIntoLevel = xp % 500;
  const xpPct = Math.round((xpIntoLevel / 500) * 100);

  // Mocked stats for display
  const stats = [
    { label: "Quests Finished", value: "24", icon: "✅" },
    { label: "Guild Rank", value: "Knight", icon: "⚔️" },
    { label: "Success Rate", value: "92%", icon: "📈" },
  ];

  /**
   * For demonstration: gain some XP manually and trigger the animation.
   */
  const handleManualXp = (e: React.MouseEvent) => {
    onXpGain(10, e.clientX, e.clientY);
    setXp((prev) => prev + 10);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "40px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* Avatar & Level */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--gold-dim))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, color: "#0d0d1a", fontWeight: 900, fontFamily: "'Cinzel', serif",
            boxShadow: "var(--glow-gold)", border: "4px solid var(--obsidian-mid)",
          }}>
            {currentUser.displayName[0]}
          </div>
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            width: 36, height: 36, borderRadius: "50%", background: "var(--teal)",
            color: "#0d0d1a", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, border: "3px solid var(--obsidian-mid)", fontSize: 14,
          }}>
            {level}
          </div>
        </div>

        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {currentUser.displayName}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>@{currentUser.username}</p>

        {/* Level Progress */}
        <div style={{ width: "100%", maxWidth: 320, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8, fontFamily: "'Cinzel', serif" }}>
            <span style={{ color: "var(--gold)" }}>LEVEL {level}</span>
            <span style={{ color: "var(--muted)" }}>{xpIntoLevel} / 500 XP</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{
              height: "100%", width: `${xpPct}%`,
              background: "linear-gradient(90deg, var(--gold-dim), var(--gold))",
              boxShadow: "0 0 10px rgba(240,192,64,0.4)",
              transition: "width 0.4s ease-out",
            }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", marginBottom: 32 }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ padding: "16px 8px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--parchment)" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button className="btn-gold" style={{ width: "100%", maxWidth: 320 }} onClick={handleManualXp}>
          ✨ Train (Gain 10 XP)
        </button>

        <div className="separator" style={{ width: "100%", margin: "40px 0" }} />

        <button
          className="btn-ghost"
          style={{ width: "100%", maxWidth: 320, color: "var(--danger)", borderColor: "rgba(224,85,85,0.2)" }}
          onClick={() => {
            localStorage.removeItem("sq_token");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
