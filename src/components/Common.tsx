import React from 'react';
import { User, ChallengeCategory } from '../types';

/**
 * Deterministic avatar color from a string. 
 * Used to ensure the same user always has the same avatar background color.
 */
export function avatarColor(str: string): string {
  const colors = ["#f0c040", "#2de0b0", "#a855f7", "#e05555", "#3b82f6", "#f97316"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

/**
 * A simple circular avatar component that displays user initials.
 */
export function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  const initials = user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = avatarColor(user.id);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: size * 0.36,
      color: "#0d0d1a", flexShrink: 0, border: "2px solid rgba(0,0,0,0.3)",
    }}>
      {initials}
    </div>
  );
}

/**
 * A themed badge to display XP amounts.
 */
export function XpBadge({ xp }: { xp: number }) {
  return (
    <span style={{
      fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 12,
      color: "var(--gold)", background: "rgba(240,192,64,0.12)",
      border: "1px solid rgba(240,192,64,0.3)", borderRadius: 6,
      padding: "2px 8px", whiteSpace: "nowrap",
    }}>
      {xp.toLocaleString()} XP
    </span>
  );
}

/**
 * A pill-shaped label for challenge categories.
 */
export function CategoryPill({ category }: { category: ChallengeCategory }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      background: `${category.color}22`, border: `1px solid ${category.color}55`,
      color: category.color,
    }}>
      <span>{category.icon}</span>
      {category.name}
    </span>
  );
}

/**
 * A simple loading spinner.
 */
export function Spinner() {
  return (
    <div style={{
      width: 24, height: 24, border: "3px solid rgba(240,192,64,0.2)",
      borderTop: "3px solid var(--gold)", borderRadius: "50%",
      animation: "spin 0.8s linear infinite", margin: "0 auto",
    }} />
  );
}

/**
 * Displays a placeholder message when a list is empty.
 */
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 12, padding: "48px 24px", opacity: 0.6, textAlign: "center",
    }}>
      <span style={{ fontSize: 40 }}>{icon}</span>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: "var(--muted)", maxWidth: 220 }}>
        {message}
      </p>
    </div>
  );
}
