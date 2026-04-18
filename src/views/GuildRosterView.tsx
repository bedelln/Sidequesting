import React, { useState, useEffect, useRef } from 'react';
import { User, GuildTab, Friendship } from '../types';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { Avatar, Spinner, EmptyState } from '../components/Common';
import { ChallengeComposerModal } from './ChallengeComposerModal';

export function GuildRosterView({
  onToast,
  onFriendsChange,
}: {
  onToast: (msg: string) => void;
  onFriendsChange: (friends: User[]) => void;
}) {
  const [tab, setTab] = useState<GuildTab>("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [composerFriendId, setComposerFriendId] = useState<string | undefined>();
  const [composerOpen, setComposerOpen] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const rosterState = useAsync(
    async () => {
      const friends = await api.friends.listAccepted();
      onFriendsChange(friends);
      return friends;
    },
    []
  );

  const pendingState = useAsync(
    () => api.friends.listPending(),
    []
  );

  const catState = useAsync(
    () => api.challenges.listCategories(),
    []
  );

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await api.friends.search(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
  }, [searchQuery]);

  const handleSendInvite = async (username: string) => {
    try {
      await api.friends.sendInvite(username);
      onToast("Guild Invite dispatched!");
      setSearchQuery("");
      setSearchResults([]);
    } catch (error: any) {
      onToast(error.message ?? "Failed to send guild invite.");
    }
  };

  const handleRespond = async (f: Friendship, status: "accepted" | "declined") => {
    try {
      await api.friends.respond(f.id, status);
    } catch (error: any) {
      onToast(error.message ?? "Failed to update guild invite.");
      return;
    }
    pendingState.setData((prev) => prev.filter((p) => p.id !== f.id));
    if (status === "accepted") {
      rosterState.setData((prev) => {
        if (!f.requester) {
          return prev;
        }
        const next = prev.some((user) => user.id === f.requester!.id)
          ? prev
          : [...prev, f.requester];
        onFriendsChange(next);
        return next;
      });
      onToast(`${f.requester?.displayName} joined your guild!`);
    } else {
      onToast("Invite declined.");
    }
  };

  const rosterFriends = rosterState.data;
  const pendingCount = pendingState.data.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div style={{ padding: "24px 20px 0" }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }} className="gold-text">
          Guild Roster
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Your allies and incoming invites</p>

        {/* Search bar */}
        <div style={{ position: "relative", marginTop: 18 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--muted)" }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "12px 16px 12px 42px", color: "var(--parchment)", fontSize: 14,
            }}
          />
          {searching && (
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
              <Spinner />
            </div>
          )}
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="card" style={{ marginTop: 8, padding: "8px 0", zIndex: 10 }}>
            {searchResults.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px" }}>
                <Avatar user={u} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.displayName}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>@{u.username}</div>
                </div>
                <button
                  className="btn-teal"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => handleSendInvite(u.username)}
                >
                  Invite
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, padding: "20px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {(["roster", "invites"] as GuildTab[]).map((t) => {
          const active = tab === t;
          const count = t === "invites" ? pendingCount : rosterFriends.length;
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
              {t.toUpperCase()} ({count})
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

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
        {tab === "roster" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rosterFriends.length > 0 ? (
              rosterFriends.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <Avatar user={u} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{u.displayName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Lvl {Math.floor(u.xp / 500) + 1} · {u.xp} XP</div>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ padding: "8px 12px", fontSize: 12 }}
                    onClick={() => {
                      setComposerFriendId(u.id);
                      setComposerOpen(true);
                    }}
                  >
                    ⚔️ Challenge
                  </button>
                </div>
              ))
            ) : (
              <EmptyState icon="👥" message="Your guild is empty. Recruit allies to share the journey!" />
            )}
          </div>
        )}

        {tab === "invites" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pendingState.data.length > 0 ? (
              pendingState.data.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <Avatar user={f.requester!} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{f.requester?.displayName}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>wants to join your guild</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-teal" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => handleRespond(f, "accepted")}>Join</button>
                    <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => handleRespond(f, "declined")}>✕</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon="📜" message="No pending invitations at the moment." />
            )}
          </div>
        )}
      </div>

      {composerOpen && (
        <ChallengeComposerModal
          friends={rosterFriends}
          categories={catState.data}
          preselectedFriendId={composerFriendId}
          onClose={() => setComposerOpen(false)}
          onSent={() => {
            setComposerOpen(false);
            onToast("Challenge dispatched!");
          }}
        />
      )}
    </div>
  );
}
