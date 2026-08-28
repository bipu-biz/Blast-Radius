import { Worker } from "bullmq";
import connection from "./connection";
import PRAnalysis from "../models/PRanalysis.modlel";

interface AnalysisJobData {
  analysisId: string;
  repoId: string;
  owner: string;
  name: string;
  headSha: string;
}

const worker = new Worker<AnalysisJobData>(
  "pr-analysis",
  async (job) => {
    const { analysisId, owner, name, headSha } = job.data;

    console.log(`processing analysis ${analysisId} for ${owner}/${name} @ ${headSha}`);

    await PRAnalysis.findByIdAndUpdate(analysisId, {
      status: "cloning",
    });

    await PRAnalysis.findByIdAndUpdate(analysisId, {
      status: "complete",
    });

    console.log(`finished analysis ${analysisId}`);
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