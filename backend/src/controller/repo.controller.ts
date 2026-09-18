import { Request, Response, NextFunction } from "express";
import axios from "axios";
import crypto from "crypto";
import apiError from "../utils/apiError";
import User from "../models/user.model";
import Repo from "../models/repo.model";
import PRAnalysis from "../models/PRanalysis.model";
import GraphSnapshot from "../models/graphsnapshot.model";

export const listAvailableRepos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new apiError(401, 'unauthorized');
    }

    const user = await User.findById(req.user._id).select('+githubaccesstoken');
    if (!user?.githubaccesstoken) {
      throw new apiError(400, 'github account not connected');
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.githubaccesstoken}`,
      },
    });

    res.status(200).json({
      success: true,
      repos: response.data,
    });
  } catch (error) {
    next(error);
  }
};

export const connectRepo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new apiError(401, 'unauthorized');
    }

    const { owner, name, githubRepoId, defaultBranch } = req.body;

    const user = await User.findById(req.user._id).select('+githubaccesstoken');
    if (!user?.githubaccesstoken) {
      throw new apiError(400, 'github account not connected');
    }

    const webhookSecret = crypto.randomBytes(32).toString('hex');

    let webhookResponse;
    try {
      webhookResponse = await axios.post(
        `https://api.github.com/repos/${owner}/${name}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['pull_request'],
          config: {
            url: `${process.env.BACKEND_URL}/api/webhooks/github`,
            content_type: 'json',
            secret: webhookSecret,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.githubaccesstoken}`,
          },
        }
      );
    } catch (err: any) {
      console.log('GITHUB REJECTED:', JSON.stringify(err.response?.data));
      throw err;
    }

    const repo = await Repo.create({
      userId: user._id,
      owner,
      name,
      fullName: `${owner}/${name}`,
      githubRepoId,
      webhookId: webhookResponse.data.id,
      webhookSecret,
      defaultBranch: defaultBranch || 'main',
    });

    res.status(201).json({
      success: true,
      message: 'repo connected successfully',
      repo,
    });
  } catch (error) {
    next(error);
  }
};

export const listConnectedRepos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new apiError(401, 'unauthorized');
    }

    const repos = await Repo.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      repos,
    });
  } catch (error) {
    next(error);
  }
};

export const getRepoAnalyses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new apiError(401, 'unauthorized');
    }

    const { repoId } = req.params;

    const repo = await Repo.findOne({ _id: repoId, userId: req.user._id });
    if (!repo) {
      throw new apiError(404, 'repo not found');
    }

    const analyses = await PRAnalysis.find({ repoId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      repo,
      analyses,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new apiError(401, 'unauthorized');
    }

    const { analysisId } = req.params;

    const analysis = await PRAnalysis.findById(analysisId);
    if (!analysis) {
      throw new apiError(404, 'analysis not found');
    }

    const repo = await Repo.findOne({ _id: analysis.repoId, userId: req.user._id });
    if (!repo) {
      throw new apiError(403, 'forbidden');
    }

    const graph = analysis.graphSnapshotId
      ? await GraphSnapshot.findById(analysis.graphSnapshotId)
      : null;

    res.status(200).json({
      success: true,
      analysis,
      graph,
      repoName: repo.fullName,
    });
  } catch (error) {
    next(error);
  }
};