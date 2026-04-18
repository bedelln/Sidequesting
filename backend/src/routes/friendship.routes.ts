import { Router } from "express";

import * as friendshipController from "../controllers/friendship.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// POST /api/friendships - Send a friend request (FR-1)
router.post("/", friendshipController.sendFriendRequest);

// GET /api/friendships?status=pending - Get pending friend requests (FR-2)
router.get("/", (req, res, next) => {
  const status = req.query.status as string;
  if (status === "pending") {
    return friendshipController.getPendingRequests(req, res, next);
  } else if (status === "accepted") {
    return friendshipController.getAcceptedFriends(req, res, next);
  }
  res.status(400).json({ message: "Invalid status parameter. Use 'pending' or 'accepted'" });
});

// PATCH /api/friendships/:id - Accept or decline a friend request (FR-2)
router.patch("/:id", friendshipController.updateFriendshipStatus);

export default router;
