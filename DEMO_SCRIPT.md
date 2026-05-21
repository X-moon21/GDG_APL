# FanPulse Cricket Demo Script

Use this for a 3-5 minute hackathon demo.

## Setup Before Judging

Start backend:

```powershell
cd backend
.\venv\Scripts\activate
python seed.py
python app.py
```

Start frontend:

```powershell
cd frontend
npm run dev
```

Open three tabs:

```text
http://localhost:5173/simulation/1
http://localhost:5173/join/1
http://localhost:5173/admin/1
```

## Demo Walkthrough

1. Introduce the problem:

   Cricket fans already use a second screen while watching matches. FanPulse turns that habit into an interactive live companion.

2. Show the simulation tab:

   Point out the broadcast scoreboard, target, players, last balls, and pitch animation area.

3. Join as a fan:

   In `/join/1`, enter a nickname and favorite team. The app redirects to the fan interaction room.

4. Show the fan room:

   Highlight next-ball prediction, over prediction, reactions, fan mood, timeline, and leaderboard.

5. Trigger match action from admin:

   In `/admin/1`, click `Four` and then `Six`.

   Expected result:

   - Simulation score updates.
   - Ball animation plays.
   - Big overlay appears.
   - Six triggers confetti.
   - Fan room timeline and scoreboard update.

6. Show prediction scoring:

   In fan room, lock a next-ball prediction.

   In admin panel, trigger the matching outcome.

   Expected result:

   - Leaderboard updates if correct.
   - Fan receives feedback toast.

7. Show DRS:

   Click `Start DRS`.

   In fan room, submit a DRS prediction.

   Click `Resolve DRS: Out` or `Resolve DRS: Not Out`.

   Expected result:

   - Big DRS result overlay appears.
   - DRS card disappears from the fan screen.
   - Correct DRS predictions score points.

8. Show poll:

   Click `Trigger Poll`.

   Vote from the fan room.

   Expected result:

   - Poll bars update.
   - User gets participation points.
   - Poll auto-closes after 30 seconds.

9. Show trivia:

   Click `Trigger Trivia`.

   Submit an answer from fan room.

   Expected result:

   - Correct answer gives points.
   - Trivia disappears from that fan screen after 20 seconds.

10. Close with future potential:

    This can connect to real match data, become a PWA, support stadium activations, and add sponsor rewards.

## Quick Recovery

If buttons stop responding:

```powershell
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force
```

Then restart backend and hard-refresh all FanPulse tabs with `Ctrl + F5`.
