import { Navigate, Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/AdminPanel.jsx";
import Home from "./pages/Home.jsx";
import JoinMatch from "./pages/JoinMatch.jsx";
import MatchRoom from "./pages/MatchRoom.jsx";
import Simulation from "./pages/Simulation.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join/:matchId" element={<JoinMatch />} />
      <Route path="/match/:matchId" element={<MatchRoom />} />
      <Route path="/simulation/:matchId" element={<Simulation />} />
      <Route path="/admin/:matchId" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
