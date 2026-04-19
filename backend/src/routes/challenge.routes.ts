import { Router } from "express";

import * as challengeController from "../controllers/challenge.controller";
import { requireAuth } from "../middleware/auth.middleware";

/**
 * RECENT DEEDS CHANGE: Added /recent-completed route.
 * To revert: Remove this route.
 */

const router = Router();

// GET /api/challenge-categories - Get all challenge categories (CH-1)
router.get("/", challengeController.getChallengeCategories);
router.get("/categories", challengeController.getChallengeCategories);

// All other routes require authentication
router.use(requireAuth);

// GET /api/challenges/inbox - Get incoming challenges (CH-2)
router.get("/inbox", challengeController.getIncomingChallenges);

// GET /api/challenges/active - Get active challenges
router.get("/active", challengeController.getActiveChallenges);

// GET /api/challenges/recent-completed - Get recent completed challenges
router.get("/recent-completed", challengeController.getRecentCompletedChallenges);

// POST /api/challenges - Create a challenge (CH-3)
router.post("/", challengeController.createChallenge);

// POST /api/challenges/:challengeId/respond - Accept or decline a challenge for the current user
router.post("/:challengeId/respond", challengeController.respondToChallenge);

// POST /api/challenges/:challengeId/complete - Complete a challenge for the current user
router.post("/:challengeId/complete", challengeController.completeChallenge);

// PATCH /api/challenges/:challengeId/recipients/:recipientId - Update recipient status (CH-4)
router.patch("/:challengeId/recipients/:recipientId", challengeController.updateChallengeRecipientStatus);

export default router;
