import React, { useState } from 'react';
import { User, ChallengeCategory } from '../types';
import { api } from '../services/api';

export function ChallengeComposerModal({
  friends,
  categories,
  preselectedFriendId,
  onClose,
  onSent,
}: {
  friends: User[];
  categories: ChallengeCategory[];
  preselectedFriendId?: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(preselectedFriendId ? [preselectedFriendId] : [])
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpOverride, setXpOverride] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const toggleFriend = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Your quest needs a title, Adventurer."); return; }
    if (!description.trim()) { setError("Describe the quest clearly."); return; }
    if (selectedIds.size === 0) { setError("Select at least one ally to challenge."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const xpReward = xpOverride ? parseInt(xpOverride) : selectedCategory?.xpReward;
      await api.challenges.create({
        recipientIds: Array.from(selectedIds),
        categoryId,
        title: title.trim(),
        description: description.trim(),
        xpReward,
      });
      onSent();
    } catch (e: any) {
      setError(e.message ?? "Failed to dispatch quest.");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)", zIndex: 5000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto",
          borderRadius: "20px 20px 0 0", padding: 28,
          borderColor: "rgba(240,192,64,0.25)", animation: "fadeUp 0.3s ease",
          background: "var(--obsidian-mid)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20 }} className="gold-text">
            ⚔️ Issue a Sidequest
          </h2>
          <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 18 }} onClick={onClose}>✕</button>
        </div>

        <label style={{ display: "block", fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
          QUEST TYPE
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                border: `1px solid ${categoryId === cat.id ? cat.color : "rgba(255,255,255,0.1)"}`,
                background: categoryId === cat.id ? `${cat.color}22` : "transparent",
                color: categoryId === cat.id ? cat.color : "var(--muted)",
                transition: "all 0.15s",
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <label style={{ display: "block", fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
          QUEST TITLE
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Morning Routine"
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "12px 16px", color: "var(--parchment)", fontSize: 14, marginBottom: 20,
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
          DESCRIPTION
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What must be done?"
          rows={3}
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "12px 16px", color: "var(--parchment)", fontSize: 14, marginBottom: 20,
            resize: "none",
          }}
        />

        <label style={{ display: "block", fontSize: 12, color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
          CHALLENGE ALLIES
        </label>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
          {friends.map((f) => {
            const isSelected = selectedIds.has(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFriend(f.id)}
                style={{
                  flexShrink: 0, width: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  background: "transparent", opacity: isSelected ? 1 : 0.5, transition: "opacity 0.2s",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", background: "var(--gold-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0d0d1a",
                  }}>
                    {f.displayName[0]}
                  </div>
                  <div style={{
                    position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--teal)" : "rgba(255,255,255,0.2)"}`,
                    background: isSelected ? "var(--teal)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#0d0d1a",
                  }}>
                    {isSelected ? "✓" : ""}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--parchment)", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.displayName.split(" ")[0]}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{
            background: "rgba(224,85,85,0.12)", border: "1px solid rgba(224,85,85,0.3)",
            borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          className="btn-gold"
          style={{ width: "100%", fontSize: 15, padding: "13px", letterSpacing: "0.06em" }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Dispatching..." : "⚔️ Dispatch Quest"}
        </button>
      </div>
    </div>
  );
}
