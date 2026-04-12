import { Request, Response } from "express";

import * as friendshipService from "../services/friendship.service";

export async function sendFriendRequest(req: Request, res: Response) {
  const userId = req.user!.id;
  const friendship = await friendshipService.sendFriendRequest(userId, req.body);
  res.status(201).json({ friendship });
}

export async function getPendingRequests(req: Request, res: Response) {
  const userId = req.user!.id;
  const requests = await friendshipService.getPendingFriendRequests(userId);
  res.json({ requests });
}

export async function getAcceptedFriends(req: Request, res: Response) {
  const userId = req.user!.id;
  const friends = await friendshipService.getAcceptedFriends(userId);
  res.json({ friends });
}

export async function updateFriendshipStatus(req: Request, res: Response) {
  const userId = req.user!.id;
  const { id } = req.params;
  const friendship = await friendshipService.updateFriendshipStatus(id, userId, req.body);
  res.json({ friendship });
}

export async function searchUsers(req: Request, res: Response) {
  const userId = req.user!.id;
  const query = req.query.q as string;
  const users = await friendshipService.searchUsers(userId, query);
  res.json({ users });
}
