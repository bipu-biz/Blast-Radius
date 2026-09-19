import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface Repo {
  _id: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
}

interface AvailableRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
}

const Dashboard = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [availableRepos, setAvailableRepos] = useState<AvailableRepo[]>([]);
  const [connecting, setConnecting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await api.get("/repos");
      setRepos(res.data.repos || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load repos");
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = async () => {
    await api.get("/repos");
    window.location.href = "http://localhost:5000/api/github/connect";
  };

  const openRepoPicker = async () => {
    try {
      const res = await api.get("/repos/available");
      setAvailableRepos(res.data.repos || []);
      setShowPicker(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load GitHub repos. Connect GitHub first.");
    }
  };

  const handleConnect = async (repo: AvailableRepo) => {
    setConnecting(repo.id);
    try {
      await api.post("/repos/connect", {
        owner: repo.owner.login,
        name: repo.name,
        githubRepoId: repo.id,
        defaultBranch: repo.default_branch,
      });
      setShowPicker(false);
      fetchRepos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to connect repo");
    } finally {
      setConnecting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1012] text-[#EDEBE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="border-b border-[#262C30] px-8 py-4 flex items-center justify-between">
        <div
          className="text-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
          style={{ fontFamily: "'Righteous', sans-serif" }}
        >
          Blast Radius
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={connectGithub}
            className="text-sm text-[#8A9199] hover:text-[#EDEBE6] transition-colors"
          >
            Connect GitHub account
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-[#8A9199] hover:text-[#EDEBE6] transition-colors"
          >
            Log out
          </button>
        </div>
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
            onClick={openRepoPicker}
            className="bg-[#FF6A39] text-[#0D1012] font-medium px-4 py-2 text-sm hover:bg-[#FF7F52] transition-colors whitespace-nowrap"
          >
            Connect a repo
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

      {showPicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0D1012] border border-[#262C30] w-full max-w-md max-h-[70vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-[#262C30] flex items-center justify-between">
              <span className="text-sm font-medium">Select a repository</span>
              <button onClick={() => setShowPicker(false)} className="text-[#8A9199] hover:text-[#EDEBE6] text-sm">
                Close
              </button>
            </div>
            {availableRepos.length === 0 ? (
              <p className="text-[#8A9199] text-sm px-5 py-6">No repositories found.</p>
            ) : (
              availableRepos.map((repo) => (
                <div key={repo.id} className="px-5 py-3 flex items-center justify-between border-b border-[#1A2024]">
                  <span className="text-sm">{repo.full_name}</span>
                  <button
                    onClick={() => handleConnect(repo)}
                    disabled={connecting === repo.id}
                    className="text-xs text-[#4FD1C5] hover:underline disabled:opacity-50"
                  >
                    {connecting === repo.id ? "Connecting…" : "Connect"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;