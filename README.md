# FanPulse Cricket

FanPulse Cricket is a live second-screen cricket experience built for a GDG hackathon demo. It simulates an India vs Australia match and lets fans interact in real time with predictions, DRS calls, polls, trivia, reactions, and leaderboards.

The project is designed to run fully offline on a laptop with three demo tabs:

- Broadcast simulation: `http://localhost:5173/simulation/1`
- Fan interaction screen: `http://localhost:5173/match/1`
- Admin control panel: `http://localhost:5173/admin/1`

## Why It Matters

Live sports audiences are already watching with a phone in hand. FanPulse Cricket turns that second screen into an interactive match companion where fans can predict the next ball, react to big moments, answer trivia, vote in polls, and compete with friends while the match unfolds.

## Core Features

- Live simulated cricket score: runs, wickets, overs, target, required runs, batters, bowler, last six balls.
- Broadcast-style simulation screen with pitch visuals, ball movement, big-moment overlays, wicket shake, and confetti.
- Fan room with next-ball predictions, over predictions, DRS prediction, poll, trivia, reactions, fan mood meter, timeline, and leaderboard.
- Admin panel to trigger deliveries, DRS, polls, trivia, innings break, and match end.
- Real-time updates with Flask-SocketIO and Socket.IO Client.
- SQLite persistence for users, match state, predictions, votes, trivia answers, reactions, and leaderboard.
- No external APIs required.

## Tech Stack

Backend:

- Python
- Flask
- Flask-SocketIO
- Flask-SQLAlchemy
- Flask-CORS
- SQLite
- Eventlet
- python-dotenv

Frontend:

- React JS with Vite
- Socket.IO Client
- React Router DOM
- Tailwind CSS
- Framer Motion
- lucide-react
- canvas-confetti

## Project Structure

```text
fanpulse-cricket/
|-- backend/
|   |-- app.py
|   |-- config.py
|   |-- extensions.py
|   |-- match_engine.py
|   |-- models.py
|   |-- scoring.py
|   |-- seed.py
|   |-- socket_events.py
|   |-- requirements.txt
|   `-- instance/
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- index.html
|   `-- src/
|-- DEMO_SCRIPT.md
|-- SUBMISSION.md
`-- README.md
```

## Quick Start

Open two PowerShell terminals from the project root.

Terminal 1, backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python seed.py
python app.py
```

Backend URL:

```text
http://localhost:5000
```

Terminal 2, frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Demo Flow

Open these tabs:

```text
http://localhost:5173/simulation/1
http://localhost:5173/join/1
http://localhost:5173/admin/1
```

Then:

1. Use `/join/1` to enter a fan nickname and favorite team.
2. The app redirects to `/match/1`.
3. In `/admin/1`, click ball outcomes such as Four, Six, Wicket, Wide, or No Ball.
4. Watch `/simulation/1` update with score, animations, overlays, and confetti.
5. Watch `/match/1` update predictions, timeline, fan mood, leaderboard, poll, trivia, and DRS cards.

Recommended moments to trigger:

- `Six` for confetti and a big broadcast overlay.
- `Wicket` for the shake animation and wicket overlay.
- `Start DRS`, then resolve as `Out` or `Not Out`.
- `Trigger Poll`; it auto-closes after 30 seconds.
- `Trigger Trivia`; after a fan submits an answer, it disappears from that fan's screen after 20 seconds.

## Seeded Demo Match

The demo seed creates:

- Match: India vs Australia
- Batting team: India
- Bowling team: Australia
- Score: 142/4
- Overs: 15.3
- Target: 181
- Current batsman: Rohit Sharma
- Non-striker: Hardik Pandya
- Current bowler: Pat Cummins
- Last balls: `["1", "4", "0", "W", "2", "6"]`

Reset demo data at any time:

```powershell
cd backend
.\venv\Scripts\activate
python seed.py
```

Or while the backend is running:

```powershell
Invoke-WebRequest -Method Post http://localhost:5000/api/seed
```

## Scoring

- Joining match: +10 points
- Correct next-ball prediction for dot/1/2/3/wide: +20 points
- Correct four prediction: +30 points
- Correct six prediction: +40 points
- Correct wicket prediction: +50 points
- Reaction once per ball: +5 points
- Poll vote: +5 points
- Correct trivia answer: +20 points
- Correct DRS prediction: +50 points

## API Endpoints

- `GET /api/health`
- `GET /api/matches`
- `GET /api/matches/1`
- `POST /api/users`
- `GET /api/leaderboard/1`
- `POST /api/seed`

## Socket Events

Client to server:

- `join_match`
- `submit_next_ball_prediction`
- `submit_over_prediction`
- `submit_drs_prediction`
- `submit_reaction`
- `submit_poll_vote`
- `submit_trivia_answer`
- `admin_trigger_ball`
- `admin_trigger_drs`
- `admin_resolve_drs`
- `admin_trigger_poll`
- `admin_trigger_trivia`
- `admin_end_innings`
- `admin_end_match`

Server to client:

- `match_state`
- `prediction_open`
- `over_prediction_open`
- `drs_open`
- `new_ball_event`
- `score_update`
- `big_moment`
- `reaction_update`
- `fan_mood_update`
- `leaderboard_update`
- `poll_open`
- `trivia_open`
- `simulation_animation`

## Troubleshooting

If backend fails with `WinError 10048`, port `5000` is already in use:

```powershell
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```

If frontend fails because port `5173` is busy:

```powershell
netstat -ano | findstr :5173
Stop-Process -Id <PID> -Force
```

If buttons do not appear to work:

- Close old FanPulse tabs.
- Restart backend and frontend.
- Reopen the three demo URLs.
- Hard-refresh the browser with `Ctrl + F5`.
- Check that `/admin/1` shows `Socket connected`.

Eventlet may print a deprecation warning. That warning is expected for this hackathon MVP and does not stop the demo.

## Environment Variables

Optional backend env values are documented in `backend/.env.example`.

Optional frontend env values are documented in `frontend/.env.example`.

The default local configuration works without creating `.env` files.

## Submission Notes

See `SUBMISSION.md` for a concise hackathon submission summary.

See `DEMO_SCRIPT.md` for a 3-5 minute demo walkthrough.

## Create a Submission Zip

From the project root:

```powershell
.\make_submission.ps1
```

This creates `fanpulse-cricket-submission.zip` one directory above the project root and excludes local-only files such as `node_modules`, `venv`, `dist`, logs, cache files, and the generated SQLite database.
