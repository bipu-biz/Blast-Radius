import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Repo {
  _id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
}

const Dashboard = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/repos", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setRepos(res.data.repos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load repos");
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = () => {
    window.location.href = "http://localhost:5000/api/github/connect";
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1012] text-[#EDEBE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="border-b border-[#262C30] px-8 py-4 flex items-center justify-between">
        <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-lg font-medium tracking-tight">
          Blast Radius
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#8A9199] hover:text-[#EDEBE6] transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-medium mb-1">
              Connected repositories
            </h1>
            <p className="text-[#8A9199] text-sm">
              Pull requests on these repos get analyzed automatically.
            </p>
          </div>
          <button
            onClick={connectGithub}
            className="bg-[#FF6A39] text-[#0D1012] font-medium px-4 py-2 text-sm hover:bg-[#FF7F52] transition-colors whitespace-nowrap"
          >
            Connect GitHub
          </button>
        </div>

        {error && (
          <div className="border border-[#FF6A39]/40 text-[#FF6A39] text-sm px-3 py-2 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-[#8A9199] text-sm">Loading…</p>
        ) : repos.length === 0 ? (
          <div className="border border-[#262C30] px-6 py-12 text-center">
            <p className="text-[#8A9199] text-sm mb-1">No repositories connected yet.</p>
            <p className="text-[#5C646B] text-xs">
              Connect your GitHub account, then pick a repo to start tracing changes.
            </p>
          </div>
        ) : (
          <div className="border border-[#262C30] divide-y divide-[#262C30]">
            {repos.map((repo) => (
              <div
                key={repo._id}
                onClick={() => navigate(`/repos/${repo._id}`)}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#12171A] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4FD1C5]" />
                  <span className="text-sm">{repo.fullName}</span>
                </div>
                <span className="text-xs text-[#5C646B]">{repo.defaultBranch}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;