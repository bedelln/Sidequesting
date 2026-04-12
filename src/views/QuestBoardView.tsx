import React, { useState } from 'react';
import { User, QuestTab, Challenge } from '../types';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { MOCK_CATEGORIES, MOCK_INBOX, MOCK_ACTIVE } from '../mocks/data';
import { QuestCard } from '../components/QuestCard';
import { EmptyState } from '../components/Common';
import { ChallengeComposerModal } from './ChallengeComposerModal';

/**
 * The QuestBoardView is the primary screen for users to manage their challenges.
 * It displays an "Inbox" for incoming challenges and an "Active" board for accepted ones.
 */
export function QuestBoardView({
  currentUser,
  friends,
  onXpGain,
  onToast,
}: {
  currentUser: User;
  friends: User[];
  onXpGain: (xp: number, x: number, y: number) => void;
  onToast: (msg: string) => void;
}) {
  const [tab, setTab] = useState<QuestTab>("inbox");
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Fetch categories, inbox quests, and active quests using the useAsync hook
  const catState = useAsync(
    () => api.challenges.listCategories().catch(() => MOCK_CATEGORIES),
    MOCK_CATEGORIES
  );

  const inboxState = useAsync(
    () => api.challenges.inbox().catch(() => MOCK_INBOX),
    MOCK_INBOX
  );

  const activeState = useAsync(
    () => api.challenges.active().catch(() => MOCK_ACTIVE),
    MOCK_ACTIVE
  );

  /**
   * Handles accepting a quest from the inbox.
   */
  const handleAccept = async (q: Challenge, e: React.MouseEvent) => {
    try {
      await api.challenges.respond(q.id, "accepted");
    } catch (_) { /* mock ok */ }
    // Update local state to reflect the change immediately
    inboxState.setData((prev) => prev.filter((c) => c.id !== q.id));
    activeState.setData((prev) => [...prev, { ...q, recipientStatus: "accepted" }]);
    onToast("A new Sidequest has arrived on your Active board!");
  };

  /**
   * Handles declining a quest from the inbox.
   */
  const handleDecline = async (q: Challenge) => {
    try {
      await api.challenges.respond(q.id, "declined");
    } catch (_) { /* mock ok */ }
    inboxState.setData((prev) => prev.filter((c) => c.id !== q.id));
    onToast("Quest declined. Seek worthier challenges.");
  };

  /**
   * Handles completing an active quest.
   */
  const handleComplete = async (q: Challenge, e: React.MouseEvent) => {
    try {
      await api.challenges.complete(q.id);
    } catch (_) { /* mock ok */ }
    // Trigger XP gain animation and notify the user
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    onXpGain(q.xpReward, rect.left + rect.width / 2, rect.top);
    activeState.setData((prev) => prev.filter((c) => c.id !== q.id));
    onToast(`Quest complete! +${q.xpReward} XP earned!`);
  };

  const filteredInbox = selectedCat
    ? inboxState.data.filter((q) => q.categoryId === selectedCat)
    : inboxState.data;

  const filteredActive = selectedCat
    ? activeState.data.filter((q) => q.categoryId === selectedCat)
    : activeState.data;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }} className="gold-text">
          Quest Board
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Your incoming and active sidequests</p>

        {/* Category filter */}
        {catState.data.length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 16, paddingBottom: 4 }}>
            <button
              onClick={() => setSelectedCat(null)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: selectedCat === null ? "rgba(240,192,64,0.15)" : "transparent",
                border: `1px solid ${selectedCat === null ? "var(--gold)" : "rgba(255,255,255,0.1)"}`,
                color: selectedCat === null ? "var(--gold)" : "var(--muted)",
                whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              All Types
            </button>
            {catState.data.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: selectedCat === cat.id ? `${cat.color}22` : "transparent",
                  border: `1px solid ${selectedCat === cat.id ? cat.color : "rgba(255,255,255,0.1)"}`,
                  color: selectedCat === cat.id ? cat.color : "var(--muted)",
                  whiteSpace: "nowrap", transition: "all 0.2s",
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, padding: "20px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {(["inbox", "active"] as QuestTab[]).map((t) => {
          const active = tab === t;
          const count = t === "inbox" ? inboxState.data.length : activeState.data.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                paddingBottom: 12, background: "transparent", position: "relative",
                fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13,
                color: active ? "var(--gold)" : "var(--muted)",
                transition: "color 0.2s",
              }}
            >
              {t.toUpperCase()} {count > 0 && `(${count})`}
              {active && (
                <div style={{
                  position: "absolute", bottom: -1, left: 0, right: 0, height: 2,
                  background: "var(--gold)", boxShadow: "var(--glow-gold)",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tab === "inbox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredInbox.length > 0 ? (
              filteredInbox.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  mode="inbox"
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))
            ) : (
              <EmptyState icon="📧" message="No new scrolls in your inbox. Check back later or rally your guild!" />
            )}
          </div>
        )}

        {tab === "active" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredActive.length > 0 ? (
              filteredActive.map((q) => (
                <QuestCard
                  key={q.id}
                  quest={q}
                  mode="active"
                  onComplete={handleComplete}
                />
              ))
            ) : (
              <EmptyState icon="⚔️" message="Your active board is empty. Accept a quest to begin your journey!" />
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="btn-gold"
        onClick={() => setComposerOpen(true)}
        style={{
          position: "fixed", bottom: 100, right: 20, width: 56, height: 56,
          borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.5), var(--glow-gold)",
          zIndex: 100,
        }}
      >
        ＋
      </button>

      {composerOpen && (
        <ChallengeComposerModal
          friends={friends}
          categories={catState.data}
          onClose={() => setComposerOpen(false)}
          onSent={() => {
            setComposerOpen(false);
            onToast("Your quest has been dispatched across the realm!");
            inboxState.refetch();
          }}
        />
      )}
    </div>
  );
}
