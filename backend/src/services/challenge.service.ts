import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

/**
 * RECENT DEEDS CHANGE: Added getRecentCompletedChallenges function for ProfileView.
 * To revert: Remove this function and related controller/route/API calls.
 */

const createChallengeSchema = z.object({
  recipientIds: z.array(z.string()).min(1, "At least one recipient is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
  xpReward: z.number().int().min(1).max(50).optional(),
  expiresAt: z.string().datetime().optional()
});

const updateChallengeRecipientStatusSchema = z.object({
  status: z.enum(["accepted", "declined", "completed"], {
    errorMap: () => ({ message: "Status must be 'accepted', 'declined', or 'completed'" })
  })
});

const respondToChallengeSchema = z.object({
  status: z.enum(["accepted", "declined"], {
    errorMap: () => ({ message: "Status must be 'accepted' or 'declined'" })
  })
});

export async function getChallengeCategories() {
  const categories = await prisma.challengeCategory.findMany({
    orderBy: { name: "asc" }
  });
  return categories;
}

export async function createChallenge(senderId: string, input: unknown) {
  const data = createChallengeSchema.parse(input);

  // Verify category exists
  const category = await prisma.challengeCategory.findUnique({
    where: { id: data.categoryId }
  });

  if (!category) {
    throw new ApiError(404, "Challenge category not found");
  }

  // Verify all recipients are friends with the sender (CH-5)
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [
        { requesterId: senderId, addresseeId: { in: data.recipientIds } },
        { addresseeId: senderId, requesterId: { in: data.recipientIds } }
      ]
    }
  });

  // Extract friend IDs from both directions
  const friendIds = new Set(
    friendships.map((f) => (f.requesterId === senderId ? f.addresseeId : f.requesterId))
  );

  // Check if all recipients are friends
  const invalidRecipients = data.recipientIds.filter((id) => !friendIds.has(id));
  if (invalidRecipients.length > 0) {
    throw new ApiError(
      403,
      "You can only send challenges to your friends (accepted friendships)"
    );
  }

  // Use category default XP if not specified
  const xpReward = data.xpReward ?? category.xpReward;

  // Create challenge with recipients
  const challenge = await prisma.challenge.create({
    data: {
      senderId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      xpReward,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      recipients: {
        create: data.recipientIds.map((recipientId) => ({
          recipientId,
          status: "pending"
        }))
      }
    },
    include: {
      category: true,
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      },
      recipients: {
        include: {
          recipient: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  return challenge;
}

async function getChallengesByStatuses(userId: string, statuses: Array<"pending" | "accepted">) {
  const challengeRecipients = await prisma.challengeRecipient.findMany({
    where: {
      recipientId: userId,
      status: { in: statuses }
    },
    include: {
      challenge: {
        include: {
          category: true,
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return challengeRecipients.map((cr) => ({
    recipientRecordId: cr.id,
    recipientStatus: cr.status,
    completedAt: cr.completedAt,
    ...cr.challenge
  }));
}

export async function getPendingChallenges(userId: string) {
  return getChallengesByStatuses(userId, ["pending"]);
}

export async function getActiveChallenges(userId: string) {
  return getChallengesByStatuses(userId, ["accepted"]);
}

function mapChallengeRecipient(challengeRecipient: {
  id: string;
  status: string;
  completedAt: Date | null;
  challenge: {
    id: string;
    senderId: string;
    categoryId: string;
    title: string;
    description: string;
    xpReward: number;
    expiresAt: Date | null;
    createdAt: Date;
    category?: unknown;
    sender?: unknown;
  };
}) {
  return {
    recipientRecordId: challengeRecipient.id,
    recipientStatus: challengeRecipient.status,
    completedAt: challengeRecipient.completedAt,
    ...challengeRecipient.challenge
  };
}

async function updateChallengeStatusForCurrentUser(
  challengeId: string,
  userId: string,
  status: "accepted" | "declined" | "completed"
) {
  const challengeRecipient = await prisma.challengeRecipient.findUnique({
    where: {
      challengeId_recipientId: {
        challengeId,
        recipientId: userId
      }
    },
    include: {
      challenge: true,
      recipient: true
    }
  });

  if (!challengeRecipient) {
    throw new ApiError(404, "Challenge not found");
  }

  if (status === "accepted" || status === "declined") {
    if (challengeRecipient.status !== "pending") {
      throw new ApiError(400, "This challenge has already been responded to");
    }
  }

  if (status === "completed") {
    if (challengeRecipient.status !== "accepted") {
      throw new ApiError(400, "Only accepted challenges can be completed");
    }
  }

  const completedAt = status === "completed" ? new Date() : null;

  const updatedRecipient = await prisma.$transaction(async (tx) => {
    const updated = await tx.challengeRecipient.update({
      where: {
        challengeId_recipientId: {
          challengeId,
          recipientId: userId
        }
      },
      data: {
        status,
        completedAt
      },
      include: {
        challenge: {
          include: {
            category: true,
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (status === "completed") {
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: challengeRecipient.challenge.xpReward
          }
        }
      });
    }

    return updated;
  });

  return mapChallengeRecipient(updatedRecipient);
}

export async function respondToChallenge(challengeId: string, userId: string, input: unknown) {
  const data = respondToChallengeSchema.parse(input);
  return updateChallengeStatusForCurrentUser(challengeId, userId, data.status);
}

export async function completeChallenge(challengeId: string, userId: string) {
  return updateChallengeStatusForCurrentUser(challengeId, userId, "completed");
}

export async function getRecentCompletedChallenges(userId: string, limit: number = 3) {
  const challengeRecipients = await prisma.challengeRecipient.findMany({
    where: {
      recipientId: userId,
      status: "completed"
    },
    include: {
      challenge: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      completedAt: "desc"
    },
    take: limit
  });

  return challengeRecipients.map((cr) => ({
    id: cr.challenge.id,
    title: cr.challenge.title,
    description: cr.challenge.description,
    xpReward: cr.challenge.xpReward,
    completedAt: cr.completedAt,
    category: cr.challenge.category
  }));
}

export async function updateChallengeRecipientStatus(
  challengeId: string,
  recipientId: string,
  userId: string,
  input: unknown
) {
  const data = updateChallengeRecipientStatusSchema.parse(input);

  // Find the challenge recipient record
  const challengeRecipient = await prisma.challengeRecipient.findUnique({
    where: {
      challengeId_recipientId: {
        challengeId,
        recipientId
      }
    },
    include: {
      challenge: true,
      recipient: true
    }
  });

  if (!challengeRecipient) {
    throw new ApiError(404, "Challenge recipient record not found");
  }

  // Verify that the current user is the recipient
  if (challengeRecipient.recipientId !== userId) {
    throw new ApiError(403, "You are not authorized to update this challenge");
  }

  return updateChallengeStatusForCurrentUser(challengeId, userId, data.status);
}
