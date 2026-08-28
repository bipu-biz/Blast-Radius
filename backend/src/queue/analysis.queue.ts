import { Queue } from "bullmq";
import connection from "./connection";

export const analysisQueue = new Queue("pr-analysis", {
  connection,
});