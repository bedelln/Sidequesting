import { Router } from "express";

import * as challengeController from "../controllers/challenge.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// GET /api/challenge-categories - Get all challenge categories (CH-1)
router.get("/", challengeController.getChallengeCategories);
router.get("/categories", challengeController.getChallengeCategories);

// All other routes require authentication
router.use(requireAuth);

// GET /api/challenges/inbox - Get incoming challenges (CH-2)
router.get("/inbox", challengeController.getIncomingChallenges);

// GET /api/challenges/active - Get active challenges
router.get("/active", challengeController.getIncomingChallenges);

// POST /api/challenges - Create a challenge (CH-3)
router.post("/", challengeController.createChallenge);

// PATCH /api/challenges/:challengeId/recipients/:recipientId - Update recipient status (CH-4)
router.patch("/:challengeId/recipients/:recipientId", challengeController.updateChallengeRecipientStatus);

export default router;
