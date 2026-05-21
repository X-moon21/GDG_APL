import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DRSPredictionCard from "../components/DRSPredictionCard.jsx";
import FanMoodMeter from "../components/FanMoodMeter.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import OverPredictionCard from "../components/OverPredictionCard.jsx";
import PollCard from "../components/PollCard.jsx";
import PredictionCard from "../components/PredictionCard.jsx";
import ReactionBar from "../components/ReactionBar.jsx";
import Scoreboard from "../components/Scoreboard.jsx";
import Timeline from "../components/Timeline.jsx";
import TriviaCard from "../components/TriviaCard.jsx";
import { socket } from "../socket.js";

export default function MatchRoom() {
  const { matchId = "1" } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("fanpulse_user_id");
  const nickname = localStorage.getItem("fanpulse_nickname") || "Fan";
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [overPrediction, setOverPrediction] = useState(null);
  const [drs, setDrs] = useState(null);
  const [poll, setPoll] = useState(null);
  const [trivia, setTrivia] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [mood, setMood] = useState({});
  const [toast, setToast] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!userId) {
      navigate(`/join/${matchId}`);
      return;
    }

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setConnected(true);
      socket.emit("join_match", { match_id: Number(matchId), user_id: Number(userId) });
    };
    const onDisconnect = () => setConnected(false);
    const onMatch = (payload) => setMatch(payload);
    const onScore = (payload) => setMatch(payload);
    const onPrediction = (payload) => setPrediction(payload);
    const onOverPrediction = (payload) => setOverPrediction(payload);
    const onDrs = (payload) => setDrs(payload);
    const onPoll = (payload) => setPoll(payload);
    const onTrivia = (payload) => setTrivia(payload);
    const onLeaderboard = (payload) => setLeaderboard(payload);
    const onBall = (payload) => setTimeline((items) => [payload, ...items].slice(0, 16));
    const onMood = (payload) => setMood(payload.counts || {});
    const onToast = (payload) => {
      setToast(payload.message || "Updated");
      window.setTimeout(() => setToast(null), 2200);
    };
    const onMoment = (payload) => {
      setToast(payload.message || payload.title || "Big moment");
      window.setTimeout(() => setToast(null), 2400);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("match_state", onMatch);
    socket.on("score_update", onScore);
    socket.on("prediction_open", onPrediction);
    socket.on("over_prediction_open", onOverPrediction);
    socket.on("drs_open", onDrs);
    socket.on("poll_open", onPoll);
    socket.on("trivia_open", onTrivia);
    socket.on("leaderboard_update", onLeaderboard);
    socket.on("new_ball_event", onBall);
    socket.on("fan_mood_update", onMood);
    socket.on("reaction_update", onMood);
    socket.on("toast", onToast);
    socket.on("big_moment", onMoment);
    socket.emit("join_match", { match_id: Number(matchId), user_id: Number(userId) });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("match_state", onMatch);
      socket.off("score_update", onScore);
      socket.off("prediction_open", onPrediction);
      socket.off("over_prediction_open", onOverPrediction);
      socket.off("drs_open", onDrs);
      socket.off("poll_open", onPoll);
      socket.off("trivia_open", onTrivia);
      socket.off("leaderboard_update", onLeaderboard);
      socket.off("new_ball_event", onBall);
      socket.off("fan_mood_update", onMood);
      socket.off("reaction_update", onMood);
      socket.off("toast", onToast);
      socket.off("big_moment", onMoment);
    };
  }, [matchId, navigate, userId]);

  const currentEntry = useMemo(
    () => leaderboard.find((entry) => Number(entry.user_id) === Number(userId)),
    [leaderboard, userId],
  );

  function emitWithUser(event, payload) {
    if (!socket.connected) {
      setToast("Socket is reconnecting. Try again in a second.");
      socket.connect();
      window.setTimeout(() => setToast(null), 2200);
      return;
    }
    socket.emit(event, { match_id: Number(matchId), user_id: Number(userId), ...payload });
  }

  function submitTriviaAnswer(triviaId, selected) {
    emitWithUser("submit_trivia_answer", { trivia_id: triviaId, selected_option: selected });
    window.setTimeout(() => {
      setTrivia((current) => (current?.id === triviaId ? null : current));
    }, 20000);
  }

  return (
    <main className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-emerald-300">Second screen</p>
            <h1 className="text-3xl font-black">Welcome, {nickname}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-md border px-3 py-2 text-sm font-bold ${connected ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100" : "border-rose-300/35 bg-rose-300/15 text-rose-100"}`}>
              {connected ? "Live" : "Reconnecting"}
            </span>
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-amber-100">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">{currentEntry?.points || 0} pts</span>
            </div>
            <Link className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10" to="/">
              Home
            </Link>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            <Scoreboard match={match} compact />
            <div className="grid gap-4 lg:grid-cols-2">
              <PredictionCard prediction={prediction} onSubmit={(selected) => emitWithUser("submit_next_ball_prediction", { selected_option: selected })} />
              <ReactionBar onReact={(emoji) => emitWithUser("submit_reaction", { emoji })} />
              <OverPredictionCard data={overPrediction} onSubmit={(selected) => emitWithUser("submit_over_prediction", { selected_option: selected })} />
              <DRSPredictionCard data={drs} onSubmit={(selected) => emitWithUser("submit_drs_prediction", { selected_option: selected })} />
              <PollCard poll={poll} onVote={(pollId, optionId) => emitWithUser("submit_poll_vote", { poll_id: pollId, option_id: optionId })} />
              <TriviaCard trivia={trivia} onSubmit={submitTriviaAnswer} />
            </div>
          </div>

          <aside className="space-y-4">
            <Leaderboard entries={leaderboard} currentUserId={userId} />
            <FanMoodMeter counts={mood} />
            <Timeline events={timeline} />
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-md border border-emerald-300/40 bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-broadcast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
