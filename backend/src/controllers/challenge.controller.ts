import { NextFunction, Request, Response } from "express";

import * as challengeService from "../services/challenge.service";

export async function getChallengeCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await challengeService.getChallengeCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function createChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const challenge = await challengeService.createChallenge(userId, req.body);
    res.status(201).json({ challenge });
  } catch (error) {
    next(error);
  }
}

export async function getIncomingChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const challenges = await challengeService.getPendingChallenges(userId);
    res.json({ challenges });
  } catch (error) {
    next(error);
  }
}

export async function getActiveChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const challenges = await challengeService.getActiveChallenges(userId);
    res.json({ challenges });
  } catch (error) {
    next(error);
  }
}

export async function respondToChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { challengeId } = req.params as { challengeId: string };
    const challenge = await challengeService.respondToChallenge(challengeId, userId, req.body);
    res.json({ challenge });
  } catch (error) {
    next(error);
  }
}

export async function completeChallenge(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { challengeId } = req.params as { challengeId: string };
    const challenge = await challengeService.completeChallenge(challengeId, userId);
    res.json({ challenge });
  } catch (error) {
    next(error);
  }
}

export async function updateChallengeRecipientStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const { challengeId, recipientId } = req.params as {
      challengeId: string;
      recipientId: string;
    };
    const challenge = await challengeService.updateChallengeRecipientStatus(
      challengeId,
      recipientId,
      userId,
      req.body
    );
    res.json({ challenge });
  } catch (error) {
    next(error);
  }
}
