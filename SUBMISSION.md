# Hackathon Submission: FanPulse Cricket

## Project Name

FanPulse Cricket

## One-Line Pitch

A real-time second-screen fan engagement app for live cricket, combining match simulation, predictions, polls, trivia, reactions, and leaderboards.

## Problem

Cricket fans often watch matches while chatting, reacting, and predicting outcomes on separate apps. That interaction is scattered and disconnected from the live match moment.

## Solution

FanPulse Cricket creates a synchronized second-screen layer for a live cricket match. A simulated broadcast screen shows the match, an admin panel drives live events, and fans interact in real time from their own match room.

## What Works in the MVP

- Live India vs Australia match simulation.
- Admin-triggered ball outcomes: dot, 1, 2, 3, four, six, wicket, wide, no ball.
- Real-time scoreboard updates across tabs.
- Ball-by-ball timeline.
- Next-ball prediction scoring.
- Over prediction card.
- DRS prediction and resolution.
- Polls that auto-close after 30 seconds.
- Trivia that hides after answer submission.
- Reactions and fan mood meter.
- Real-time leaderboard.
- Broadcast-style animation, overlays, wicket shake, and confetti.

## Demo URLs

Run locally:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Simulation: `http://localhost:5173/simulation/1`
- Fan room: `http://localhost:5173/match/1`
- Admin panel: `http://localhost:5173/admin/1`

## Technical Highlights

- Flask-SocketIO powers real-time bidirectional updates.
- SQLite and SQLAlchemy keep the MVP simple and portable.
- React, Tailwind, and Framer Motion create a clear demo-friendly UI.
- The app needs no external APIs, cloud services, or authentication setup.
- State changes are broadcast to all connected views, making the three-tab demo easy to understand.

## Impact

FanPulse Cricket can be extended into a live sports engagement product for stadiums, broadcasters, streaming platforms, fan clubs, and fantasy sports communities.

## Future Scope

- Multi-match support.
- Real score API integration.
- Auth and user profiles.
- Sponsor-branded polls and rewards.
- Match highlights and replay moments.
- Persistent season leaderboard.
- Mobile-first PWA install experience.
