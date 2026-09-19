import { useEffect, useState } from "react";
import api from "../services/api";
import { useParams, Link } from "react-router-dom";
import ReactFlow, { Background } from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

interface AnalysisData {
  status: string;
  prNumber: number;
  riskScore: number;
  aiSummary: string | null;
  affectedNodes: { nodeId: string; path: string; riskWeight: number }[];
  changedFiles: string[];
}

interface GraphData {
  nodes: { nodeId: string; path: string }[];
  edges: { from: string; to: string }[];
}

const AnalysisDetail = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [repoName, setRepoName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const res = await api.get(`/analyses/${analysisId}`);
      setAnalysis(res.data.analysis);
      setGraph(res.data.graph);
      setRepoName(res.data.repoName);
    } finally {
      setLoading(false);
    }
  };

  const buildFlowElements = (): { nodes: Node[]; edges: Edge[] } => {
    if (!graph) return { nodes: [], edges: [] };

    const affectedIds = new Set(analysis?.affectedNodes.map((n) => n.nodeId) || []);
    const changedIds = new Set(analysis?.changedFiles || []);

    const nodes: Node[] = graph.nodes.map((n, i) => {
      const isChanged = changedIds.has(n.path);
      const isAffected = affectedIds.has(n.nodeId);

      return {
        id: n.nodeId,
        position: { x: (i % 8) * 180, y: Math.floor(i / 8) * 100 },
        data: { label: n.path.split("/").pop() },
        style: {
          background: isChanged ? "#FF6A39" : isAffected ? "#4FD1C5" : "#161B1E",
          color: isChanged || isAffected ? "#0D1012" : "#8A9199",
          border: "1px solid #262C30",
          fontSize: 11,
          borderRadius: 0,
          padding: "6px 10px",
        },
      };
    });

    const edges: Edge[] = graph.edges.map((e, i) => ({
      id: `e${i}`,
      source: e.from,
      target: e.to,
      style: { stroke: "#262C30" },
    }));

    return { nodes, edges };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1012] text-[#8A9199] flex items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  const { nodes, edges } = buildFlowElements();

  return (
    <div className="min-h-screen bg-[#0D1012] text-[#EDEBE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="border-b border-[#262C30] px-8 py-4">
        <div
          className="text-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
          style={{ fontFamily: "'Righteous', sans-serif" }}
        >
          Blast Radius
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <p className="text-sm text-[#8A9199] mb-1">{repoName}</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-medium mb-6">
          PR #{analysis?.prNumber}
        </h1>

        <div className="flex gap-6 mb-8 text-sm">
          <div>
            <span className="text-[#5C646B]">Status</span>{" "}
            <span className="text-[#4FD1C5]">{analysis?.status}</span>
          </div>
          <div>
            <span className="text-[#5C646B]">Risk score</span>{" "}
            <span className="text-[#FF6A39]">{analysis?.riskScore}</span>
          </div>
        </div>

        {analysis?.aiSummary && (
          <div className="border border-[#262C30] px-5 py-4 mb-8 text-sm leading-relaxed text-[#C9C7C2]">
            {analysis.aiSummary}
          </div>
        )}

        <div className="border border-[#262C30]" style={{ height: 500 }}>
          <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
            <Background color="#1A2024" gap={20} />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
};

export default AnalysisDetail;