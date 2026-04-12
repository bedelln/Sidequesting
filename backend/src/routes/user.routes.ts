import { Router } from "express";

import { getMe } from "../controllers/user.controller";
import { searchUsers } from "../controllers/friendship.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/search", requireAuth, searchUsers);

export default router;
