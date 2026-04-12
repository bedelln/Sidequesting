import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

const createChallengeSchema = z.object({
  recipientIds: z.array(z.string()).min(1, "At least one recipient is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
  xpReward: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional()
});

const updateChallengeRecipientStatusSchema = z.object({
  status: z.enum(["accepted", "declined", "completed"], {
    errorMap: () => ({ message: "Status must be 'accepted', 'declined', or 'completed'" })
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

export async function getIncomingChallenges(userId: string) {
  const challengeRecipients = await prisma.challengeRecipient.findMany({
    where: {
      recipientId: userId,
      status: { in: ["pending", "accepted"] }
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

  // Update status
  const completedAt = data.status === "completed" ? new Date() : null;

  const updatedRecipient = await prisma.$transaction(async (tx) => {
    // Update the recipient status
    const updated = await tx.challengeRecipient.update({
      where: {
        challengeId_recipientId: {
          challengeId,
          recipientId
        }
      },
      data: {
        status: data.status,
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

    // If completed, award XP to the user (LB-1)
    if (data.status === "completed") {
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

  return updatedRecipient;
}
