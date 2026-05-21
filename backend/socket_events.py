from collections import Counter, defaultdict
from datetime import datetime
import traceback

from flask_socketio import emit, join_room

from extensions import db, socketio
from match_engine import apply_ball, normalize_outcome
from models import (
    BallEvent,
    Match,
    Poll,
    PollOption,
    Prediction,
    Reaction,
    TriviaAnswer,
    TriviaQuestion,
    Vote,
)
from scoring import (
    DRS_POINTS,
    JOIN_POINTS,
    POLL_POINTS,
    REACTION_POINTS,
    TRIVIA_POINTS,
    add_points,
    ball_prediction_points,
    get_or_create_leaderboard,
    leaderboard_payload,
    over_prediction_result,
)


fan_mood = defaultdict(Counter)
active_drs = {}
over_markers = defaultdict(lambda: {"runs": 0, "over": None})


def room(match_id):
    return f"match_{match_id}"


def emit_match_state(match_id):
    match = Match.query.get(match_id)
    if match:
        socketio.emit("match_state", match.to_dict(), room=room(match_id))


def emit_leaderboard(match_id):
    socketio.emit("leaderboard_update", leaderboard_payload(match_id), room=room(match_id))


def open_next_ball_prediction(match_id):
    socketio.emit(
        "prediction_open",
        {
            "match_id": match_id,
            "question": "What happens on the next ball?",
            "options": [
                {"key": "dot", "label": "Dot Ball", "points": 20},
                {"key": "1", "label": "1 Run", "points": 20},
                {"key": "2", "label": "2 Runs", "points": 20},
                {"key": "3", "label": "3 Runs", "points": 20},
                {"key": "four", "label": "Four", "points": 30},
                {"key": "six", "label": "Six", "points": 40},
                {"key": "wicket", "label": "Wicket", "points": 50},
                {"key": "wide", "label": "Wide/No Ball", "points": 20},
            ],
        },
        room=room(match_id),
    )


def over_prediction_payload(match):
    return {
        "match_id": match.id,
        "question": f"How many runs will {match.batting_team} score this over?",
        "over": match.overs + 1,
        "options": [
            {"key": "0-6", "label": "0-6 runs"},
            {"key": "7-10", "label": "7-10 runs"},
            {"key": "11-15", "label": "11-15 runs"},
            {"key": "16+", "label": "16+ runs"},
        ],
    }


def open_over_prediction(match):
    over_markers[match.id] = {"runs": match.runs, "over": match.overs}
    socketio.emit("over_prediction_open", over_prediction_payload(match), room=room(match.id))


def ensure_over_prediction(match):
    marker = over_markers.get(match.id)
    if not marker or marker.get("over") != match.overs:
        open_over_prediction(match)
        return
    emit("over_prediction_open", over_prediction_payload(match))


def active_poll_payload(match_id):
    poll = Poll.query.filter_by(match_id=match_id, is_active=True).order_by(Poll.created_at.desc()).first()
    return poll.to_dict() if poll else None


def active_trivia_payload(match_id):
    trivia = (
        TriviaQuestion.query.filter_by(match_id=match_id, is_active=True)
        .order_by(TriviaQuestion.created_at.desc())
        .first()
    )
    return trivia.to_dict() if trivia else None


def close_poll_after_delay(app, poll_id, match_id, delay_seconds=30):
    socketio.sleep(delay_seconds)
    with app.app_context():
        poll = Poll.query.get(poll_id)
        if not poll or not poll.is_active:
            return

        poll.is_active = False
        db.session.commit()
        socketio.emit("poll_open", None, room=room(match_id))


def resolve_ball_predictions(match_id, actual_result):
    unresolved = Prediction.query.filter_by(
        match_id=match_id,
        prediction_type="next_ball",
        actual_result=None,
    ).all()

    for prediction in unresolved:
        selected = "wide" if prediction.selected_option in {"wide", "no_ball", "extra"} else prediction.selected_option
        actual = "wide" if actual_result in {"wide", "no_ball", "extra"} else actual_result
        prediction.actual_result = actual
        prediction.is_correct = selected == actual
        if prediction.is_correct:
            points = ball_prediction_points(actual)
            prediction.points_awarded = points
            add_points(match_id, prediction.user_id, points, "ball")


def maybe_resolve_over_predictions(match, previous_overs, previous_balls):
    if match.balls != 0 or match.overs == previous_overs:
        return

    marker = over_markers.get(match.id)
    if not marker or marker.get("over") != previous_overs:
        open_over_prediction(match)
        return

    over_runs = match.runs - marker.get("runs", match.runs)
    actual = over_prediction_result(over_runs)
    predictions = Prediction.query.filter_by(
        match_id=match.id,
        prediction_type="over",
        actual_result=None,
    ).all()
    for prediction in predictions:
        prediction.actual_result = actual
        prediction.is_correct = prediction.selected_option == actual
        if prediction.is_correct:
            prediction.points_awarded = 30
            add_points(match.id, prediction.user_id, 30, "over")

    socketio.emit(
        "big_moment",
        {
            "type": "OVER_COMPLETE",
            "title": "Over complete",
            "message": f"Over {previous_overs + 1}: {over_runs} runs. Prediction result: {actual}",
        },
        room=room(match.id),
    )
    open_over_prediction(match)


def register_socket_events(app):
    @socketio.on_error_default
    def handle_socket_error(error):
        print("Socket.IO handler error:", error, flush=True)
        traceback.print_exc()

    @socketio.on("join_match")
    def handle_join_match(data):
        match_id = int(data.get("match_id", 1))
        user_id = data.get("user_id")
        join_room(room(match_id))

        match = Match.query.get(match_id)
        if not match:
            emit("error", {"message": "Match not found"})
            return

        if user_id:
            entry = get_or_create_leaderboard(match_id, int(user_id))
            if entry.points == 0:
                entry.points += JOIN_POINTS
                db.session.commit()

        emit("match_state", match.to_dict())
        emit("leaderboard_update", leaderboard_payload(match_id))
        emit("prediction_open", {
            "match_id": match_id,
            "question": "What happens on the next ball?",
            "options": [
                {"key": "dot", "label": "Dot Ball", "points": 20},
                {"key": "1", "label": "1 Run", "points": 20},
                {"key": "2", "label": "2 Runs", "points": 20},
                {"key": "3", "label": "3 Runs", "points": 20},
                {"key": "four", "label": "Four", "points": 30},
                {"key": "six", "label": "Six", "points": 40},
                {"key": "wicket", "label": "Wicket", "points": 50},
                {"key": "wide", "label": "Wide/No Ball", "points": 20},
            ],
        })
        ensure_over_prediction(match)

        poll = active_poll_payload(match_id)
        if poll:
            emit("poll_open", poll)

        trivia = active_trivia_payload(match_id)
        if trivia:
            emit("trivia_open", trivia)

        if match_id in active_drs:
            emit("drs_open", active_drs[match_id])

    @socketio.on("submit_next_ball_prediction")
    def handle_next_ball_prediction(data):
        match_id = int(data.get("match_id", 1))
        user_id = int(data.get("user_id"))
        selected = normalize_outcome(data.get("selected_option", "dot"))

        prediction = Prediction.query.filter_by(
            match_id=match_id,
            user_id=user_id,
            prediction_type="next_ball",
            actual_result=None,
        ).first()
        if prediction:
            prediction.selected_option = selected
            prediction.created_at = datetime.utcnow()
        else:
            prediction = Prediction(
                match_id=match_id,
                user_id=user_id,
                prediction_type="next_ball",
                selected_option=selected,
            )
            db.session.add(prediction)

        db.session.commit()
        emit("toast", {"message": "Prediction locked in."})

    @socketio.on("submit_over_prediction")
    def handle_over_prediction(data):
        match_id = int(data.get("match_id", 1))
        user_id = int(data.get("user_id"))
        selected = data.get("selected_option", "7-10")

        prediction = Prediction.query.filter_by(
            match_id=match_id,
            user_id=user_id,
            prediction_type="over",
            actual_result=None,
        ).first()
        if prediction:
            prediction.selected_option = selected
            prediction.created_at = datetime.utcnow()
        else:
            db.session.add(
                Prediction(
                    match_id=match_id,
                    user_id=user_id,
                    prediction_type="over",
                    selected_option=selected,
                )
            )
        db.session.commit()
        emit("toast", {"message": "Over prediction saved."})

    @socketio.on("submit_drs_prediction")
    def handle_drs_prediction(data):
        match_id = int(data.get("match_id", 1))
        user_id = int(data.get("user_id"))
        selected = data.get("selected_option", "out")

        prediction = Prediction.query.filter_by(
            match_id=match_id,
            user_id=user_id,
            prediction_type="drs",
            actual_result=None,
        ).first()
        if prediction:
            prediction.selected_option = selected
            prediction.created_at = datetime.utcnow()
        else:
            db.session.add(
                Prediction(
                    match_id=match_id,
                    user_id=user_id,
                    prediction_type="drs",
                    selected_option=selected,
                )
            )
        db.session.commit()
        emit("toast", {"message": "DRS call locked."})

    @socketio.on("submit_reaction")
    def handle_reaction(data):
        match_id = int(data.get("match_id", 1))
        user_id = int(data.get("user_id"))
        emoji = data.get("emoji", "🔥")
        ball_event = (
            BallEvent.query.filter_by(match_id=match_id)
            .order_by(BallEvent.created_at.desc())
            .first()
        )
        if not ball_event:
            emit("toast", {"message": "Wait for the next delivery to react."})
            return

        existing = Reaction.query.filter_by(
            match_id=match_id,
            ball_event_id=ball_event.id,
            user_id=user_id,
        ).first()
        if existing:
            emit("toast", {"message": "Reaction already counted for this ball."})
            return

        db.session.add(
            Reaction(
                match_id=match_id,
                ball_event_id=ball_event.id,
                user_id=user_id,
                emoji=emoji,
            )
        )
        add_points(match_id, user_id, REACTION_POINTS, "reaction")
        fan_mood[match_id][emoji] += 1
        db.session.commit()

        socketio.emit("reaction_update", {"emoji": emoji, "counts": dict(fan_mood[match_id])}, room=room(match_id))
        socketio.emit("fan_mood_update", {"counts": dict(fan_mood[match_id])}, room=room(match_id))
        emit_leaderboard(match_id)
        emit("toast", {"message": f"+{REACTION_POINTS} reaction points"})

    @socketio.on("submit_poll_vote")
    def handle_poll_vote(data):
        match_id = int(data.get("match_id", 1))
        poll_id = int(data.get("poll_id"))
        option_id = int(data.get("option_id"))
        user_id = int(data.get("user_id"))

        existing = Vote.query.filter_by(poll_id=poll_id, user_id=user_id).first()
        if existing:
            emit("toast", {"message": "Vote already counted."})
            return

        option = PollOption.query.get(option_id)
        if not option:
            emit("toast", {"message": "Poll option not found."})
            return

        option.vote_count += 1
        db.session.add(Vote(poll_id=poll_id, option_id=option_id, user_id=user_id))
        add_points(match_id, user_id, POLL_POINTS)
        db.session.commit()

        poll = Poll.query.get(poll_id)
        socketio.emit("poll_open", poll.to_dict(), room=room(match_id))
        emit_leaderboard(match_id)
        emit("toast", {"message": f"+{POLL_POINTS} for voting"})

    @socketio.on("submit_trivia_answer")
    def handle_trivia_answer(data):
        match_id = int(data.get("match_id", 1))
        trivia_id = int(data.get("trivia_id"))
        user_id = int(data.get("user_id"))
        selected = data.get("selected_option", "A").upper()

        existing = TriviaAnswer.query.filter_by(trivia_id=trivia_id, user_id=user_id).first()
        if existing:
            emit("toast", {"message": "Trivia answer already submitted."})
            return

        trivia = TriviaQuestion.query.get(trivia_id)
        if not trivia:
            emit("toast", {"message": "Trivia not found."})
            return

        is_correct = selected == trivia.correct_option
        points = TRIVIA_POINTS if is_correct else 0
        db.session.add(
            TriviaAnswer(
                trivia_id=trivia_id,
                user_id=user_id,
                selected_option=selected,
                is_correct=is_correct,
                points_awarded=points,
            )
        )
        if is_correct:
            add_points(match_id, user_id, points, "trivia")
        db.session.commit()

        emit_leaderboard(match_id)
        emit(
            "toast",
            {
                "message": f"Correct! +{points} points" if is_correct else "Good try. The crowd keeps buzzing.",
                "correct": is_correct,
            },
        )

    @socketio.on("admin_trigger_ball")
    def handle_admin_trigger_ball(data):
        match_id = int(data.get("match_id", 1))
        outcome = data.get("outcome", "dot")
        match = Match.query.get(match_id)
        if not match:
            emit("error", {"message": "Match not found"})
            return

        previous_overs = match.overs
        previous_balls = match.balls
        event, meta = apply_ball(match, outcome)
        db.session.add(event)
        db.session.flush()

        actual = "wide" if event.outcome in {"wide", "no_ball"} else event.outcome
        resolve_ball_predictions(match_id, actual)
        maybe_resolve_over_predictions(match, previous_overs, previous_balls)
        db.session.commit()

        payload = event.to_dict()
        socketio.emit("new_ball_event", payload, room=room(match_id))
        socketio.emit("score_update", match.to_dict(), room=room(match_id))
        socketio.emit(
            "simulation_animation",
            {
                "outcome": event.outcome,
                "label": meta["label"],
                "description": event.description,
                "is_boundary": event.is_boundary,
                "is_wicket": event.is_wicket,
            },
            room=room(match_id),
        )

        if event.is_boundary or event.is_wicket:
            socketio.emit(
                "big_moment",
                {
                    "type": event.outcome.upper(),
                    "title": meta["label"],
                    "message": event.description,
                },
                room=room(match_id),
            )

        emit_leaderboard(match_id)
        open_next_ball_prediction(match_id)

    @socketio.on("admin_trigger_drs")
    def handle_admin_trigger_drs(data):
        match_id = int(data.get("match_id", 1))
        active_drs[match_id] = {
            "match_id": match_id,
            "question": "DRS review: what will the umpire decide?",
            "options": [
                {"key": "out", "label": "Out"},
                {"key": "not_out", "label": "Not Out"},
            ],
        }
        socketio.emit("drs_open", active_drs[match_id], room=room(match_id))
        socketio.emit(
            "big_moment",
            {"type": "DRS", "title": "DRS Review", "message": "Decision pending. Fans, make the call."},
            room=room(match_id),
        )

    @socketio.on("admin_resolve_drs")
    def handle_admin_resolve_drs(data):
        match_id = int(data.get("match_id", 1))
        result = data.get("result", "not_out")
        predictions = Prediction.query.filter_by(
            match_id=match_id,
            prediction_type="drs",
            actual_result=None,
        ).all()
        for prediction in predictions:
            prediction.actual_result = result
            prediction.is_correct = prediction.selected_option == result
            if prediction.is_correct:
                prediction.points_awarded = DRS_POINTS
                add_points(match_id, prediction.user_id, DRS_POINTS, "drs")

        active_drs.pop(match_id, None)
        db.session.commit()
        socketio.emit("drs_open", None, room=room(match_id))
        socketio.emit(
            "big_moment",
            {
                "type": "DRS_RESULT",
                "title": "OUT" if result == "out" else "NOT OUT",
                "message": "Third umpire has made the call.",
            },
            room=room(match_id),
        )
        emit_leaderboard(match_id)

    @socketio.on("admin_trigger_poll")
    def handle_admin_trigger_poll(data):
        match_id = int(data.get("match_id", 1))
        Poll.query.filter_by(match_id=match_id, is_active=True).update({"is_active": False})
        poll = Poll(
            match_id=match_id,
            question=data.get("question", "Who is winning the momentum right now?"),
            is_active=True,
        )
        db.session.add(poll)
        db.session.flush()
        for option_text in data.get("options", ["India", "Australia", "Too close to call"]):
            db.session.add(PollOption(poll_id=poll.id, option_text=option_text, vote_count=0))
        db.session.commit()
        socketio.emit("poll_open", poll.to_dict(), room=room(match_id))
        socketio.start_background_task(close_poll_after_delay, app, poll.id, match_id, 30)
        socketio.emit(
            "big_moment",
            {"type": "POLL", "title": "Fan Poll", "message": poll.question},
            room=room(match_id),
        )

    @socketio.on("admin_trigger_trivia")
    def handle_admin_trigger_trivia(data):
        match_id = int(data.get("match_id", 1))
        TriviaQuestion.query.filter_by(match_id=match_id, is_active=True).update({"is_active": False})
        trivia = TriviaQuestion(
            match_id=match_id,
            question=data.get("question", "Who won the 2011 Cricket World Cup?"),
            option_a=data.get("option_a", "India"),
            option_b=data.get("option_b", "Australia"),
            option_c=data.get("option_c", "England"),
            option_d=data.get("option_d", "Sri Lanka"),
            correct_option=data.get("correct_option", "A"),
            is_active=True,
        )
        db.session.add(trivia)
        db.session.commit()
        socketio.emit("trivia_open", trivia.to_dict(), room=room(match_id))
        socketio.emit(
            "big_moment",
            {"type": "TRIVIA", "title": "Trivia Time", "message": trivia.question},
            room=room(match_id),
        )

    @socketio.on("admin_end_innings")
    def handle_admin_end_innings(data):
        match_id = int(data.get("match_id", 1))
        match = Match.query.get(match_id)
        if match:
            match.status = "innings_break"
            db.session.commit()
            socketio.emit("score_update", match.to_dict(), room=room(match_id))
            socketio.emit(
                "big_moment",
                {"type": "INNINGS", "title": "Innings Break", "message": "Teams reset for the chase."},
                room=room(match_id),
            )

    @socketio.on("admin_end_match")
    def handle_admin_end_match(data):
        match_id = int(data.get("match_id", 1))
        match = Match.query.get(match_id)
        if match:
            match.status = "completed"
            db.session.commit()
            socketio.emit("score_update", match.to_dict(), room=room(match_id))
            socketio.emit(
                "big_moment",
                {"type": "MATCH", "title": "Match Complete", "message": "That is the end of the demo match."},
                room=room(match_id),
            )
