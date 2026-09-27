import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import RepoDetail from "./pages/RepoDetail";
import AnalysisDetail from "./pages/AnalysisDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repos/:repoId" element={<RepoDetail />} />
         <Route path="/analyses/:analysisId" element={<AnalysisDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;