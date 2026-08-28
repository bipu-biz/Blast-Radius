import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import apiError from "../utils/apiError";
import Repo from "../models/repo.model";
import PRAnalysis from "../models/PRanalysis.modlel";
import { analysisQueue } from "../queue/analysis.queue";

export const githubWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const event = req.headers['x-github-event'] as string;

    if (!signature) {
      throw new apiError(401, 'no signature provided');
    }

    const rawBody = req.body as Buffer;
    const payload = JSON.parse(rawBody.toString('utf-8'));

    const githubRepoId = payload?.repository?.id;

    if (!githubRepoId) {
      throw new apiError(400, 'no repository id in payload');
    }

    const repo = await Repo.findOne({ githubRepoId }).select('+webhookSecret');

    if (!repo) {
      throw new apiError(404, 'repo not found');
    }

    const expectedSignature =
      'sha256=' +
      crypto
        .createHmac('sha256', repo.webhookSecret as string)
        .update(rawBody)
        .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      throw new apiError(401, 'invalid signature');
    }

    if (event !== 'pull_request') {
      return res.status(200).json({ message: 'event ignored' });
    }

    const { action, pull_request } = payload;

    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return res.status(200).json({ message: 'action ignored' });
    }

    const analysis = await PRAnalysis.create({
      repoId: repo._id,
      prNumber: pull_request.number,
      headSha: pull_request.head.sha,
      status: 'queued',
      changedFiles: [],
    });

    await analysisQueue.add("analyze-pr", {
      analysisId: analysis._id.toString(),
      repoId: repo._id.toString(),
      owner: repo.owner,
      name: repo.name,
      headSha: pull_request.head.sha,
    });

    res.status(200).json({
      success: true,
      message: 'webhook received, analysis queued',
      analysisId: analysis._id,
    });
  } catch (error) {
    next(error);
  }
};