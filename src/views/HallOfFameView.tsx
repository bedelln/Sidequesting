import React from 'react';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { MOCK_LEADERBOARD } from '../mocks/data';
import { Avatar, XpBadge } from '../components/Common';

export function HallOfFameView({ currentUserId }: { currentUserId: string }) {
  const { data } = useAsync(
    () => api.leaderboard.list().catch(() => MOCK_LEADERBOARD),
    MOCK_LEADERBOARD
  );

  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const maxXp = data[0]?.user.xp || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "24px 20px" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }} className="gold-text">
          Hall of Fame
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Top adventurers in the realm</p>

        {/* Podium */}
        {data.length >= 3 && (
          <div
            style={{
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              gap: 16, marginBottom: 32, padding: "24px 0",
            }}
          >
            {[1, 0, 2].map((idx) => {
              const entry = data[idx];
              if (!entry) return null;
              const heights = [80, 100, 60];
              const height = heights[[1, 0, 2].indexOf(idx)];
              const isMe = entry.user.id === currentUserId;
              return (
                <div
                  key={entry.user.id}
                  className="fade-up"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                >
                  <div style={{ fontSize: 22 }}>{medals[entry.rank] ?? entry.rank}</div>
                  <div style={{ position: "relative" }}>
                    <Avatar user={entry.user} size={idx === 0 ? 52 : 42} />
                    {isMe && (
                      <div style={{
                        position: "absolute", inset: -3, borderRadius: "50%",
                        border: "2px solid var(--gold)", animation: "glowPulse 2s ease infinite",
                      }} />
                    )}
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, textAlign: "center", maxWidth: 80 }}>
                    {entry.user.displayName.split(" ")[0]}
                  </div>
                  <XpBadge xp={entry.user.xp} />
                  <div style={{
                    width: 64, background: "rgba(240,192,64,0.12)",
                    border: "1px solid rgba(240,192,64,0.25)",
                    borderRadius: "6px 6px 0 0", height,
                  }} />
                </div>
              );
            })}
          </div>
        )}

        <div className="separator" />

        {/* Full ranked list */}
        {data.map((entry, i) => {
          const isMe = entry.user.id === currentUserId || entry.isCurrentUser;
          const pct = Math.round((entry.user.xp / maxXp) * 100);
          return (
            <div
              key={entry.user.id}
              className="card fade-up"
              style={{
                marginBottom: 8, padding: "14px 16px",
                borderColor: isMe ? "rgba(240,192,64,0.4)" : "var(--card-border)",
                background: isMe ? "rgba(240,192,64,0.05)" : "var(--card)",
                animationDelay: `${i * 0.04}s`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 28, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16,
                  color: entry.rank <= 3 ? "var(--gold)" : "var(--muted)", textAlign: "center",
                }}>
                  {medals[entry.rank] ?? `#${entry.rank}`}
                </div>
                <Avatar user={entry.user} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: isMe ? "var(--gold)" : "var(--parchment)" }}>
                    {entry.user.displayName} {isMe && <span style={{ fontSize: 11, color: "var(--teal)" }}>· YOU</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>@{entry.user.username}</div>
                </div>
                <XpBadge xp={entry.user.xp} />
              </div>
              {/* XP bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`, borderRadius: 2,
                  background: isMe
                    ? "linear-gradient(90deg, #f0c040, #fde89a)"
                    : "linear-gradient(90deg, var(--teal-dim), var(--teal))",
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
