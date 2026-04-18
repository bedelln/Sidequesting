import { NextFunction, Request, Response } from "express";

import * as leaderboardService from "../services/leaderboard.service";

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const leaderboard = await leaderboardService.getLeaderboard(userId);
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
}
