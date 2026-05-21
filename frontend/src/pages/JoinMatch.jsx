import { ArrowRight, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../socket.js";

export default function JoinMatch() {
  const { matchId = "1" } = useParams();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(localStorage.getItem("fanpulse_nickname") || "");
  const [favoriteTeam, setFavoriteTeam] = useState(localStorage.getItem("fanpulse_team") || "India");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname || "Fan",
          favorite_team: favoriteTeam,
          match_id: Number(matchId),
        }),
      });
      if (!res.ok) throw new Error("Could not join match");
      const data = await res.json();
      localStorage.setItem("fanpulse_user_id", data.user.id);
      localStorage.setItem("fanpulse_nickname", data.user.nickname);
      localStorage.setItem("fanpulse_team", data.user.favorite_team);
      navigate(`/match/${matchId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <form onSubmit={handleSubmit} className="surface w-full max-w-lg rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-emerald-300 text-emerald-950">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase text-emerald-300">Join match</p>
            <h1 className="text-3xl font-black">FanPulse Cricket</h1>
          </div>
        </div>

        <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="nickname">
          Nickname
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="Captain Cool"
          className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-emerald-300"
        />

        <label className="mt-4 block text-sm font-semibold text-slate-200" htmlFor="team">
          Favorite team
        </label>
        <select
          id="team"
          value={favoriteTeam}
          onChange={(event) => setFavoriteTeam(event.target.value)}
          className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-emerald-300"
        >
          <option>India</option>
          <option>Australia</option>
        </select>

        {error && <p className="mt-3 rounded-md bg-rose-500/15 p-3 text-sm text-rose-100">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 py-3 font-bold text-emerald-950 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Joining..." : "Enter Match Room"}
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </main>
  );
}
