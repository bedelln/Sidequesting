import { User, Friendship, ChallengeCategory, Challenge, LeaderboardEntry } from "../types";

export const CURRENT_USER: User = {
  id: "u-000",
  username: "heroprotagonist",
  displayName: "Hero Protagonist",
  avatarUrl: "",
  xp: 1250,
  createdAt: new Date().toISOString(),
};

export const MOCK_CATEGORIES: ChallengeCategory[] = [
  { id: "c1", name: "Fitness",    icon: "⚔️",  color: "#e05555", xpReward: 100 },
  { id: "c2", name: "Courage",    icon: "🛡️",  color: "#f0c040", xpReward: 150 },
  { id: "c3", name: "Wisdom",     icon: "📜",  color: "#2de0b0", xpReward: 80  },
  { id: "c4", name: "Creativity", icon: "🔮",  color: "#a855f7", xpReward: 120 },
  { id: "c5", name: "Endurance",  icon: "🔥",  color: "#f97316", xpReward: 200 },
  { id: "c6", name: "Social",     icon: "⭐",  color: "#3b82f6", xpReward: 60  },
];

export const MOCK_FRIENDS: User[] = [
  { id: "u-1", username: "theron", displayName: "Theron Gale",   avatarUrl: "", xp: 2380 },
  { id: "u-2", username: "lyra",   displayName: "Lyra Emberveil", avatarUrl: "", xp: 1990 },
  { id: "u-3", username: "daxon",  displayName: "Daxon Crest",   avatarUrl: "", xp: 1740 },
  { id: "u-4", username: "selva",  displayName: "Selva Nightrun", avatarUrl: "", xp: 980  },
].map((u) => ({ ...u, createdAt: new Date().toISOString() }));

export const MOCK_FRIENDSHIPS: Friendship[] = MOCK_FRIENDS.map((f, i) => ({
  id: `fr-${i}`,
  requesterId: f.id,
  addresseeId: CURRENT_USER.id,
  status: "accepted",
  requester: f,
  addressee: CURRENT_USER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const MOCK_PENDING: Friendship[] = [
  {
    id: "fr-p1",
    requesterId: "u-5",
    addresseeId: CURRENT_USER.id,
    status: "pending",
    requester: { id: "u-5", username: "zephyra", displayName: "Zephyra Dusk", avatarUrl: "", xp: 550, createdAt: "" },
    addressee: CURRENT_USER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_INBOX: Challenge[] = [
  {
    id: "ch-1",
    senderId: "u-1",
    sender: MOCK_FRIENDS[0],
    categoryId: "c1",
    category: MOCK_CATEGORIES[0],
    title: "Dawn Warrior",
    description: "Complete a 30-minute workout before sunrise. Screenshot your fitness app as proof.",
    xpReward: 150,
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    recipientStatus: "pending",
    recipientRecordId: "rr-1",
  },
  {
    id: "ch-2",
    senderId: "u-2",
    sender: MOCK_FRIENDS[1],
    categoryId: "c3",
    category: MOCK_CATEGORIES[2],
    title: "Lorekeeper",
    description: "Read for 45 consecutive minutes without touching your phone. Honor system — do you dare?",
    xpReward: 80,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    recipientStatus: "pending",
    recipientRecordId: "rr-2",
  },
];

export const MOCK_ACTIVE: Challenge[] = [
  {
    id: "ch-3",
    senderId: "u-3",
    sender: MOCK_FRIENDS[2],
    categoryId: "c2",
    category: MOCK_CATEGORIES[1],
    title: "The Cold Plunge",
    description: "Take a full cold shower for at least 2 minutes. Emerge victorious.",
    xpReward: 200,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    recipientStatus: "accepted",
    recipientRecordId: "rr-3",
  },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: MOCK_FRIENDS[0] },
  { rank: 2, user: MOCK_FRIENDS[1] },
  { rank: 3, user: MOCK_FRIENDS[2] },
  { rank: 4, user: { ...CURRENT_USER }, isCurrentUser: true },
  { rank: 5, user: MOCK_FRIENDS[3] },
].sort((a, b) => a.rank - b.rank);
