import { Request, Response } from "express";

import * as challengeService from "../services/challenge.service";

export async function getChallengeCategories(req: Request, res: Response) {
  const categories = await challengeService.getChallengeCategories();
  res.json({ categories });
}

export async function createChallenge(req: Request, res: Response) {
  const userId = req.user!.id;
  const challenge = await challengeService.createChallenge(userId, req.body);
  res.status(201).json({ challenge });
}

export async function getIncomingChallenges(req: Request, res: Response) {
  const userId = req.user!.id;
  const challenges = await challengeService.getIncomingChallenges(userId);
  res.json({ challenges });
}

export async function updateChallengeRecipientStatus(req: Request, res: Response) {
  const userId = req.user!.id;
  const { challengeId, recipientId } = req.params;
  const challengeRecipient = await challengeService.updateChallengeRecipientStatus(
    challengeId,
    recipientId,
    userId,
    req.body
  );
  res.json({ challengeRecipient });
}
