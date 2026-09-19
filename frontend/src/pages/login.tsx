import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import GraphVisual from "../components/GraphVisual";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", response.data.accesstoken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0D1012] text-[#EDEBE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 border-r border-[#262C30]">
        <div
          className="text-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
          style={{ fontFamily: "'Righteous', sans-serif" }}
        >
          Blast Radius
        </div>
        <div className="flex flex-col gap-8">
          <GraphVisual />
          <p className="text-[#8A9199] max-w-xs text-sm leading-relaxed">
            See what actually breaks before you merge.
          </p>
        </div>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-medium mb-1">
            Log in
          </h1>
          <p className="text-[#8A9199] text-sm mb-8">Continue analyzing your pull requests.</p>

          {error && (
            <div className="border border-[#FF6A39]/40 text-[#FF6A39] text-sm px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm text-[#8A9199] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border border-[#262C30] px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-[#4FD1C5] transition-colors"
          />

          <label className="block text-sm text-[#8A9199] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-[#262C30] px-3 py-2.5 mb-6 text-sm focus:outline-none focus:border-[#4FD1C5] transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6A39] text-[#0D1012] font-medium py-2.5 text-sm hover:bg-[#FF7F52] transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          <p className="text-sm text-[#8A9199] text-center mt-6">
            New here?{" "}
            <Link to="/register" className="text-[#4FD1C5] hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;