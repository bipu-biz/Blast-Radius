import axios from "axios";

interface SummaryInput {
  changedFiles: string[];
  affectedNodes: { path: string; riskWeight: number }[];
  riskScore: number;
}

export const generateRiskSummary = async ({ changedFiles, affectedNodes, riskScore }: SummaryInput): Promise<string> => {
  const topAffected = [...affectedNodes]
    .sort((a, b) => b.riskWeight - a.riskWeight)
    .slice(0, 10)
    .map((n) => `${n.path} (${n.riskWeight} dependents)`)
    .join("\n");

  const prompt = `You are a senior engineer reviewing a pull request's impact analysis. Given the following data, write a concise 2-3 sentence plain-English risk summary for a code reviewer.

Changed files:
${changedFiles.join("\n")}

Top affected files (by number of dependents):
${topAffected}

Total risk score: ${riskScore}

Write only the summary, no preamble.`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content.trim();
};