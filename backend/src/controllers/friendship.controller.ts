import { NextFunction, Request, Response } from "express";

import * as friendshipService from "../services/friendship.service";

export async function sendFriendRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const friendship = await friendshipService.sendFriendRequest(userId, req.body);
    res.status(201).json({ friendship });
  } catch (error) {
    next(error);
  }
}

export async function getPendingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const requests = await friendshipService.getPendingFriendRequests(userId);
    res.json({ requests });
  } catch (error) {
    next(error);
  }
}

export async function getAcceptedFriends(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const friends = await friendshipService.getAcceptedFriends(userId);
    res.json({ friends });
  } catch (error) {
    next(error);
  }
}

export async function updateFriendshipStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { id } = req.params as { id: string };
    const friendship = await friendshipService.updateFriendshipStatus(id, userId, req.body);
    res.json({ friendship });
  } catch (error) {
    next(error);
  }
}

export async function searchUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const query = req.query.q as string;
    const users = await friendshipService.searchUsers(userId, query);
    res.json({ users });
  } catch (error) {
    next(error);
  }
}
