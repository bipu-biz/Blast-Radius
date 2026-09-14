import { Worker } from "bullmq";
import connection from "./connection";
import PRAnalysis from "../models/PRanalysis.model";
import GraphSnapshot from "../models/graphsnapshot.model";
import { cloneRepo, cleanupClone } from "../services/clone.service";
import {
  getAllSourceFiles,
  extractImports,
  buildDependencyGraph,
  computeBlastRadius,
} from "../services/parser.service";
import { generateRiskSummary } from "../services/ai.service";
import User from "../models/user.model";
import Repo from "../models/repo.model";
import { emitAnalysisProgress } from "../sockets/socket";

interface AnalysisJobData {
  analysisId: string;
  repoId: string;
  owner: string;
  name: string;
  headSha: string;
  changedFiles: string[];
}

const worker = new Worker<AnalysisJobData>(
  "pr-analysis",
  async (job) => {
    const { analysisId, repoId, owner, name, headSha, changedFiles } = job.data;

    try {
      await PRAnalysis.findByIdAndUpdate(analysisId, { status: "cloning" });
      emitAnalysisProgress(analysisId, { status: "cloning" });

      const repoDoc = await Repo.findById(repoId);
      if (!repoDoc) throw new Error("repo not found");

      const userDoc = await User.findById(repoDoc.userId).select('+githubaccesstoken');
      if (!userDoc?.githubaccesstoken) throw new Error("github token not found");

      let clonedPath: string | null = null;

      try {
        clonedPath = await cloneRepo({
          owner,
          name,
          headSha,
          githubAccessToken: userDoc.githubaccesstoken,
        });

        await PRAnalysis.findByIdAndUpdate(analysisId, { status: "parsing" });
        emitAnalysisProgress(analysisId, { status: "parsing" });

        const files = getAllSourceFiles(clonedPath);
        const fileImports = extractImports(files);
        const graph = buildDependencyGraph(clonedPath, fileImports);

        const graphSnapshot = await GraphSnapshot.create({
          repoId,
          sha: headSha,
          nodes: graph.nodes,
          edges: graph.edges,
        });

        await PRAnalysis.findByIdAndUpdate(analysisId, {
          status: "analyzing",
          graphSnapshotId: graphSnapshot._id,
        });
        emitAnalysisProgress(analysisId, { status: "analyzing" });

        const affectedNodes = computeBlastRadius(graph, changedFiles);
        const riskScore = affectedNodes.reduce((sum, n) => sum + n.riskWeight, 0);

        const aiSummary = await generateRiskSummary({
          changedFiles,
          affectedNodes,
          riskScore,
        });

        await PRAnalysis.findByIdAndUpdate(analysisId, {
          affectedNodes,
          riskScore,
          aiSummary,
          status: "complete",
        });
        emitAnalysisProgress(analysisId, {
          status: "complete",
          affectedNodes,
          riskScore,
          aiSummary,
        });
      } finally {
        if (clonedPath) {
          cleanupClone(clonedPath);
        }
      }
    } catch (error: any) {
      console.log('WORKER ERROR DETAILS:', error.message, error.response?.data || '');
      await PRAnalysis.findByIdAndUpdate(analysisId, {
        status: "failed",
        errorMessage: error.message,
      });
      emitAnalysisProgress(analysisId, { status: "failed", errorMessage: error.message });
      throw error;
    }
  },
  {
    connection,
  }
);

worker.on("completed", (job) => {
  console.log(`job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`job ${job?.id} failed:`, err.message);
});

export default worker;