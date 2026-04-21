import React, { useEffect, useState } from "react";

import { Avatar, EmptyState, Spinner, XpBadge } from "../components/Common";
import { api } from "../services/api";
import { AdminUserDetail, Challenge, User } from "../types";
import { ProfileView } from "./ProfileView";

export function AdminConsoleView({
  currentUser,
  onCurrentUserChange,
  onToast,
}: {
  currentUser: User;
  onCurrentUserChange: (user: User) => void;
  onToast: (msg: string) => void;
}) {
  const [section, setSection] = useState<"users" | "profile">("users");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [xpDraft, setXpDraft] = useState("");
  const [xpSaving, setXpSaving] = useState(false);

  const trimmedSearch = searchInput.trim().toLowerCase();
  const filteredUsers = trimmedSearch
    ? allUsers.filter((user) => {
        return (
          user.username.toLowerCase().includes(trimmedSearch) ||
          user.displayName.toLowerCase().includes(trimmedSearch) ||
          user.email.toLowerCase().includes(trimmedSearch)
        );
      })
    : allUsers;

  const loadAllUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const users = await api.admin.users();
      setAllUsers(users);
      setSelectedUserId((prev) => prev ?? users[0]?.id ?? null);
    } catch (error: any) {
      setUsersError(error.message ?? "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const user = await api.admin.userDetails(userId);
      setSelectedUser(user);
      setXpDraft(String(user.xp));
    } catch (error: any) {
      setDetailError(error.message ?? "Failed to load user details");
      setSelectedUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      return;
    }

    loadUserDetails(selectedUserId);
  }, [selectedUserId]);

  useEffect(() => {
    if (!trimmedSearch) {
      setSearchError(null);
      return;
    }

    setSearchError(filteredUsers.length > 0 ? null : "No users matched that search.");
  }, [filteredUsers.length, trimmedSearch]);

  useEffect(() => {
    if (!filteredUsers.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(filteredUsers[0]?.id ?? null);
    }
  }, [filteredUsers, selectedUserId]);

  const handleSaveXp = async () => {
    if (!selectedUser) return;

    const nextXp = Number(xpDraft);
    if (!Number.isInteger(nextXp) || nextXp < 0) {
      setDetailError("XP must be a whole number zero or greater");
      return;
    }

    setXpSaving(true);
    setDetailError(null);
    try {
      const updatedUser = await api.admin.updateXp(selectedUser.id, nextXp);
      setSelectedUser((prev) => (prev ? { ...prev, xp: updatedUser.xp } : prev));
      setAllUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? { ...user, xp: updatedUser.xp } : user))
      );

      if (updatedUser.id === currentUser.id) {
        onCurrentUserChange({ ...currentUser, xp: updatedUser.xp });
      }

      onToast("User XP updated.");
    } catch (error: any) {
      setDetailError(error.message ?? "Failed to update XP");
    } finally {
      setXpSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Delete ${selectedUser.displayName}'s account? This cannot be undone.`)) return;

    try {
      await api.admin.deleteUser(selectedUser.id);
      setAllUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setSelectedUser(null);
      setSelectedUserId(null);
      onToast("User account deleted.");
    } catch (error: any) {
      setDetailError(error.message ?? "Failed to delete user");
    }
  };

  const handleDeleteChallenge = async (challenge: Challenge) => {
    if (!window.confirm(`Delete "${challenge.title}"? This cannot be undone.`)) return;

    try {
      await api.challenges.removeAsAdmin(challenge.id);
      if (selectedUserId) {
        await loadUserDetails(selectedUserId);
      }
      onToast("Challenge removed.");
    } catch (error: any) {
      setDetailError(error.message ?? "Failed to delete challenge");
    }
  };

  const renderUserRow = (user: User) => {
    const isSelected = selectedUserId === user.id;

    return (
      <button
        key={user.id}
        onClick={() => setSelectedUserId(user.id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderRadius: 14,
          background: isSelected ? "rgba(240,192,64,0.12)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${isSelected ? "rgba(240,192,64,0.45)" : "rgba(255,255,255,0.08)"}`,
          textAlign: "left",
          flexShrink: 0,
        }}
      >
        <Avatar user={user} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "var(--parchment)", fontWeight: 700, fontSize: 14 }}>{user.displayName}</span>
            {user.role === "admin" ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#191523",
                  background: "var(--gold)",
                  borderRadius: 999,
                  padding: "3px 8px",
                }}
              >
                Admin
              </span>
            ) : null}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>
            @{user.username} • {user.email}
          </div>
        </div>
        <XpBadge xp={user.xp} />
      </button>
    );
  };

  const renderChallengeRow = (challenge: Challenge, meta: string) => {
    return (
      <div
        key={`${challenge.id}-${meta}`}
        className="card"
        style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--parchment)", fontWeight: 700, fontSize: 14 }}>{challenge.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{challenge.description}</div>
          </div>
          <button
            className="btn-ghost"
            onClick={() => handleDeleteChallenge(challenge)}
            style={{ color: "var(--danger)", borderColor: "rgba(224,85,85,0.24)", padding: "8px 12px" }}
          >
            Remove
          </button>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 11 }}>
          {challenge.category?.name ?? "Uncategorized"} • {challenge.xpReward} XP • {meta}
        </div>
      </div>
    );
  };

  if (section === "profile") {
    return (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
        <div style={{ padding: "24px 20px 0", display: "flex", gap: 10 }}>
          <button
            className={section === "users" ? "btn-ghost" : "btn-gold"}
            onClick={() => setSection("users")}
            style={{ flex: 1, padding: "12px 14px" }}
          >
            Users
          </button>
          <button
            className={section === "profile" ? "btn-gold" : "btn-ghost"}
            onClick={() => setSection("profile")}
            style={{ flex: 1, padding: "12px 14px" }}
          >
            Profile
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ProfileView currentUser={currentUser} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1
            style={{ fontFamily: "'Cinzel', serif", fontWeight: 900, fontSize: 26, lineHeight: 1.1, marginBottom: 4 }}
            className="gold-text"
          >
            Admin Console
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Manage users, XP, and challenge records</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={section === "users" ? "btn-gold" : "btn-ghost"}
            onClick={() => setSection("users")}
            style={{ flex: 1, padding: "12px 14px" }}
          >
            Users
          </button>
          <button
            className={section === "profile" ? "btn-gold" : "btn-ghost"}
            onClick={() => setSection("profile")}
            style={{ flex: 1, padding: "12px 14px" }}
          >
            Profile
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search username, display name, or email"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "14px 16px",
              color: "var(--parchment)",
              fontSize: 14,
            }}
          />
          {trimmedSearch ? (
            <button className="btn-ghost" type="button" onClick={() => setSearchInput("")} style={{ padding: "0 16px" }}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          className="card"
          style={{
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            height: 210,
            overflowY: "auto",
          }}
        >
          {usersLoading ? (
            <Spinner />
          ) : usersError ? (
            <div style={{ color: "var(--danger)", fontSize: 13 }}>{usersError}</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(renderUserRow)
          ) : (
            <EmptyState
              icon={trimmedSearch ? "🔎" : "👥"}
              message={trimmedSearch ? searchError ?? "No users matched that search." : "No users found."}
            />
          )}
        </div>

        {detailLoading ? (
          <div className="card" style={{ padding: 24 }}>
            <Spinner />
          </div>
        ) : detailError ? (
          <div className="card" style={{ padding: 20, color: "var(--danger)", fontSize: 13 }}>{detailError}</div>
        ) : selectedUser ? (
          <>
            <div className="card" style={{ padding: 20, display: "grid", gap: 16, overflow: "visible" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar user={selectedUser} size={56} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--parchment)", fontSize: 18, fontWeight: 700 }}>{selectedUser.displayName}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                    @{selectedUser.username} • {selectedUser.email}
                  </div>
                </div>
                <XpBadge xp={selectedUser.xp} />
              </div>

              <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Edit XP
              </div>

              <input
                value={xpDraft}
                onChange={(event) => setXpDraft(event.target.value)}
                type="number"
                min={0}
                step={1}
                placeholder="XP"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  color: "var(--parchment)",
                  fontSize: 14,
                }}
              />

              <button
                className="btn-gold"
                onClick={handleSaveXp}
                disabled={xpSaving}
                style={{ width: "100%", minHeight: 50, padding: "12px 16px" }}
              >
                {xpSaving ? "Saving..." : "Save XP"}
              </button>

              <button
                className="btn-ghost"
                onClick={handleDeleteUser}
                style={{
                  width: "100%",
                  minHeight: 50,
                  padding: "12px 16px",
                  color: "var(--danger)",
                  borderColor: "rgba(224,85,85,0.24)",
                }}
              >
                Delete Account
              </button>
            </div>

            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--gold)", marginBottom: 12 }}>
                Sent Challenges
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedUser.sentChallenges.length > 0 ? (
                  selectedUser.sentChallenges.map((challenge) =>
                    renderChallengeRow(
                      challenge,
                      `Sent to ${challenge.recipients.length} recipient${challenge.recipients.length === 1 ? "" : "s"}`
                    )
                  )
                ) : (
                  <div className="card" style={{ padding: 18, color: "var(--muted)", fontSize: 13 }}>
                    No sent challenges for this user.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--gold)", marginBottom: 12 }}>
                Received Challenges
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedUser.receivedChallenges.length > 0 ? (
                  selectedUser.receivedChallenges.map((challenge) =>
                    renderChallengeRow(
                      challenge,
                      `From ${challenge.sender?.displayName ?? "Unknown"} • ${challenge.recipientStatus ?? "pending"}`
                    )
                  )
                ) : (
                  <div className="card" style={{ padding: 18, color: "var(--muted)", fontSize: 13 }}>
                    No received challenges for this user.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon="🧭" message="Choose a user to inspect their account and challenge activity." />
        )}
      </div>
    </div>
  );
}
