import { Router } from "express";

import * as leaderboardController from "../controllers/leaderboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/leaderboard - Get XP-ranked list of friends (LB-3)
router.get("/", leaderboardController.getLeaderboard);

export default router;
