import { Link } from "react-router-dom";
import GraphVisual from "../components/GraphVisual";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0D1012] text-[#EDEBE6]" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="px-8 py-6 flex items-center justify-between border-b border-[#262C30]">
        <div style={{ fontFamily: "'Righteous', sans-serif" }} className="text-xl">
          Blast Radius
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-[#8A9199] hover:text-[#EDEBE6] transition-colors">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-[#FF6A39] text-[#0D1012] font-medium px-4 py-2 hover:bg-[#FF7F52] transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-medium mb-4">
          See what actually breaks before you merge.
        </h1>
        <p className="text-[#8A9199] max-w-xl mx-auto mb-10">
          Connect a repo. Every pull request gets an automatic dependency graph analysis,
          showing exactly what's downstream of the change — before your reviewer has to guess.
        </p>
        <Link
          to="/register"
          className="inline-block bg-[#FF6A39] text-[#0D1012] font-medium px-6 py-3 hover:bg-[#FF7F52] transition-colors"
        >
          Get started
        </Link>

        <div className="flex justify-center mt-16">
          <GraphVisual />
        </div>
      </main>
    </div>
  );
};

export default Landing;