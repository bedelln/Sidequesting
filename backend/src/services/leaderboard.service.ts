import { prisma } from "../lib/prisma";

export async function getLeaderboard(userId: string) {
  // Get all accepted friendships where user is involved
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }]
    },
    select: {
      requesterId: true,
      addresseeId: true
    }
  });

  // Extract friend IDs
  const friendIds = friendships.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));

  // Include the current user in the leaderboard
  const allUserIds = [userId, ...friendIds];

  // Get users with their XP, sorted by XP descending
  const leaderboard = await prisma.user.findMany({
    where: {
      id: { in: allUserIds }
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xp: true
    },
    orderBy: {
      xp: "desc"
    }
  });

  // Add rank to each entry
  const rankedLeaderboard = leaderboard.map((user, index) => ({
    rank: index + 1,
    user,
    isCurrentUser: user.id === userId
  }));

  return rankedLeaderboard;
}
