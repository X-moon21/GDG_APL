from extensions import db
from models import Leaderboard


JOIN_POINTS = 10
REACTION_POINTS = 5
TRIVIA_POINTS = 20
DRS_POINTS = 50
POLL_POINTS = 5

BALL_POINTS = {
    "dot": 20,
    "1": 20,
    "2": 20,
    "3": 20,
    "four": 30,
    "six": 40,
    "wicket": 50,
    "wide": 20,
    "no_ball": 20,
    "extra": 20,
}

OVER_POINTS = {
    "0-6": 20,
    "7-10": 30,
    "11-15": 40,
    "16+": 50,
}


def get_or_create_leaderboard(match_id, user_id):
    entry = Leaderboard.query.filter_by(match_id=match_id, user_id=user_id).first()
    if entry:
        return entry

    entry = Leaderboard(match_id=match_id, user_id=user_id, points=0)
    db.session.add(entry)
    db.session.flush()
    return entry


def add_points(match_id, user_id, points, category=None):
    entry = get_or_create_leaderboard(match_id, user_id)
    entry.points += points

    if category == "ball":
        entry.correct_ball_predictions += 1
    elif category == "over":
        entry.correct_over_predictions += 1
    elif category == "trivia":
        entry.correct_trivia += 1
    elif category == "drs":
        entry.correct_drs_predictions += 1
    elif category == "reaction":
        entry.reactions_count += 1

    db.session.flush()
    return entry


def leaderboard_payload(match_id, limit=10):
    entries = (
        Leaderboard.query.filter_by(match_id=match_id)
        .order_by(Leaderboard.points.desc(), Leaderboard.updated_at.desc())
        .limit(limit)
        .all()
    )
    return [entry.to_dict() for entry in entries]


def ball_prediction_points(result):
    return BALL_POINTS.get(result, 20)


def over_prediction_result(runs):
    if runs <= 6:
        return "0-6"
    if runs <= 10:
        return "7-10"
    if runs <= 15:
        return "11-15"
    return "16+"
