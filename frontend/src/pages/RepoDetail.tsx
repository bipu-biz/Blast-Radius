import { useEffect, useState } from "react";
import api from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";

interface Analysis {
  _id: string;
  prNumber: number;
  status: string;
  riskScore: number;
  aiSummary: string | null;
  createdAt: string;
}

const RepoDetail = () => {
  const { repoId } = useParams();
  const [repoName, setRepoName] = useState("");
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, [repoId]);

  const fetchAnalyses = async () => {
    try {
      const res = await api.get(`/repos/${repoId}/analyses`);
      setRepoName(res.data.repo.fullName);
      setAnalyses(res.data.analyses || []);
    } catch (err) {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "complete") return "#4FD1C5";
    if (status === "failed") return "#FF6A39";
    return "#8A9199";
  };

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

      <main className="max-w-4xl mx-auto px-8 py-12">
        <Link to="/dashboard" className="text-sm text-[#8A9199] hover:text-[#EDEBE6] transition-colors">
          ← Back
        </Link>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-medium mt-3 mb-8">
          {repoName || "Loading…"}
        </h1>

        {loading ? (
          <p className="text-[#8A9199] text-sm">Loading…</p>
        ) : analyses.length === 0 ? (
          <div className="border border-[#262C30] px-6 py-12 text-center">
            <p className="text-[#8A9199] text-sm">No pull requests analyzed yet.</p>
            <p className="text-[#5C646B] text-xs mt-1">Open a PR on this repo to see it here.</p>
          </div>
        ) : (
          <div className="border border-[#262C30] divide-y divide-[#262C30]">
            {analyses.map((a) => (
              <div
                key={a._id}
                onClick={() => navigate(`/analyses/${a._id}`)}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#12171A] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: statusColor(a.status) }}
                  />
                  <span className="text-sm">PR #{a.prNumber}</span>
                  <span className="text-xs text-[#5C646B]">{a.status}</span>
                </div>
                {a.status === "complete" && (
                  <span className="text-xs text-[#8A9199]">risk {a.riskScore}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RepoDetail;