import React from 'react';
import { Challenge } from '../types';
import { Avatar, XpBadge, CategoryPill } from './Common';

/**
 * A component to display a single quest (challenge) in the UI.
 * It can be rendered in two modes: "inbox" for pending quests or "active" for accepted quests.
 */
export function QuestCard({
  quest,
  mode,
  onAccept,
  onDecline,
  onComplete,
}: {
  quest: Challenge;
  mode: "inbox" | "active";
  onAccept?: (q: Challenge, e: React.MouseEvent) => void;
  onDecline?: (q: Challenge) => void;
  onComplete?: (q: Challenge, e: React.MouseEvent) => void;
}) {
  // Determine UI state based on quest status and mode
  const isUnread = mode === "inbox" && quest.recipientStatus === "pending";
  const cat = quest.category;
  const accentColor = cat?.color ?? "var(--gold)";

  // Calculate remaining days until expiration
  const expiresIn = quest.expiresAt
    ? Math.max(0, Math.floor((new Date(quest.expiresAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div
      className="card fade-up"
      style={{
        padding: "18px 20px",
        borderColor: isUnread ? `${accentColor}44` : "var(--card-border)",
        boxShadow: isUnread ? `0 0 18px ${accentColor}18` : "none",
      }}
    >
      {/* Header section with sender info and XP badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        {quest.sender && <Avatar user={quest.sender} size={36} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--parchment)" }}>
              {quest.title}
            </span>
            {isUnread && (
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`, flexShrink: 0,
              }} />
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            from <strong style={{ color: "var(--parchment)" }}>{quest.sender?.displayName}</strong>
          </div>
        </div>
        <XpBadge xp={quest.xpReward} />
      </div>

      {/* Main body of the quest */}
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
        {quest.description}
      </p>

      {/* Metadata like category and expiration date */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {cat && <CategoryPill category={cat} />}
        {expiresIn !== null && (
          <span style={{ fontSize: 12, color: expiresIn <= 1 ? "var(--danger)" : "var(--muted)" }}>
            ⏳ {expiresIn === 0 ? "Expires today" : `${expiresIn}d left`}
          </span>
        )}
      </div>

      {/* Action buttons based on the current mode */}
      {mode === "inbox" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-teal"
            style={{ flex: 1, fontSize: 13, padding: "8px 12px" }}
            onClick={(e) => onAccept?.(quest, e)}
          >
            ⚔️ Accept Quest
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: 13, padding: "8px 14px" }}
            onClick={() => onDecline?.(quest)}
          >
            Decline
          </button>
        </div>
      )}
      {mode === "active" && (
        <button
          className="btn-gold"
          style={{ width: "100%", fontSize: 13, padding: "9px 12px" }}
          onClick={(e) => onComplete?.(quest, e)}
        >
          ✅ Mark Complete
        </button>
      )}
    </div>
  );
}
