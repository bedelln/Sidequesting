import { Request, Response } from "express";

import * as leaderboardService from "../services/leaderboard.service";

export async function getLeaderboard(req: Request, res: Response) {
  const userId = req.user!.id;
  const leaderboard = await leaderboardService.getLeaderboard(userId);
  res.json({ leaderboard });
}
