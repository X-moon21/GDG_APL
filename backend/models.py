import json
from datetime import datetime

from extensions import db


def utcnow():
    return datetime.utcnow()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(80), nullable=False)
    favorite_team = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nickname": self.nickname,
            "favorite_team": self.favorite_team,
            "created_at": self.created_at.isoformat(),
        }


class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team_a = db.Column(db.String(80), nullable=False)
    team_b = db.Column(db.String(80), nullable=False)
    batting_team = db.Column(db.String(80), nullable=False)
    bowling_team = db.Column(db.String(80), nullable=False)
    runs = db.Column(db.Integer, default=0)
    wickets = db.Column(db.Integer, default=0)
    overs = db.Column(db.Integer, default=0)
    balls = db.Column(db.Integer, default=0)
    target = db.Column(db.Integer, nullable=True)
    innings = db.Column(db.Integer, default=1)
    status = db.Column(db.String(40), default="live")
    current_batsman = db.Column(db.String(100), nullable=False)
    non_striker = db.Column(db.String(100), nullable=False)
    current_bowler = db.Column(db.String(100), nullable=False)
    last_balls = db.Column(db.Text, default="[]")
    created_at = db.Column(db.DateTime, default=utcnow)

    ball_events = db.relationship("BallEvent", backref="match", lazy=True, cascade="all, delete-orphan")

    @property
    def overs_display(self):
        return f"{self.overs}.{self.balls}"

    def get_last_balls(self):
        try:
            return json.loads(self.last_balls or "[]")
        except json.JSONDecodeError:
            return []

    def set_last_balls(self, values):
        self.last_balls = json.dumps(values[-6:])

    def to_dict(self):
        required_runs = None
        if self.target:
            required_runs = max(self.target - self.runs, 0)

        return {
            "id": self.id,
            "team_a": self.team_a,
            "team_b": self.team_b,
            "batting_team": self.batting_team,
            "bowling_team": self.bowling_team,
            "runs": self.runs,
            "wickets": self.wickets,
            "overs": self.overs,
            "balls": self.balls,
            "overs_display": self.overs_display,
            "target": self.target,
            "required_runs": required_runs,
            "innings": self.innings,
            "status": self.status,
            "current_batsman": self.current_batsman,
            "non_striker": self.non_striker,
            "current_bowler": self.current_bowler,
            "last_balls": self.get_last_balls(),
            "created_at": self.created_at.isoformat(),
        }


class BallEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    over_number = db.Column(db.Integer, nullable=False)
    ball_number = db.Column(db.Integer, nullable=False)
    outcome = db.Column(db.String(40), nullable=False)
    runs = db.Column(db.Integer, default=0)
    is_wicket = db.Column(db.Boolean, default=False)
    is_boundary = db.Column(db.Boolean, default=False)
    is_extra = db.Column(db.Boolean, default=False)
    description = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "match_id": self.match_id,
            "over_number": self.over_number,
            "ball_number": self.ball_number,
            "outcome": self.outcome,
            "runs": self.runs,
            "is_wicket": self.is_wicket,
            "is_boundary": self.is_boundary,
            "is_extra": self.is_extra,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
        }


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    prediction_type = db.Column(db.String(50), nullable=False)
    selected_option = db.Column(db.String(50), nullable=False)
    actual_result = db.Column(db.String(50), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    points_awarded = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)


class Reaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    ball_event_id = db.Column(db.Integer, db.ForeignKey("ball_event.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    emoji = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "match_id": self.match_id,
            "ball_event_id": self.ball_event_id,
            "user_id": self.user_id,
            "emoji": self.emoji,
            "created_at": self.created_at.isoformat(),
        }


class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    options = db.relationship("PollOption", backref="poll", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "match_id": self.match_id,
            "question": self.question,
            "is_active": self.is_active,
            "options": [option.to_dict() for option in self.options],
            "created_at": self.created_at.isoformat(),
        }


class PollOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey("poll.id"), nullable=False)
    option_text = db.Column(db.String(160), nullable=False)
    vote_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "poll_id": self.poll_id,
            "option_text": self.option_text,
            "vote_count": self.vote_count,
        }


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey("poll.id"), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey("poll_option.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class TriviaQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    option_a = db.Column(db.String(160), nullable=False)
    option_b = db.Column(db.String(160), nullable=False)
    option_c = db.Column(db.String(160), nullable=False)
    option_d = db.Column(db.String(160), nullable=False)
    correct_option = db.Column(db.String(1), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=utcnow)

    def to_dict(self, include_answer=False):
        payload = {
            "id": self.id,
            "match_id": self.match_id,
            "question": self.question,
            "options": [
                {"key": "A", "text": self.option_a},
                {"key": "B", "text": self.option_b},
                {"key": "C", "text": self.option_c},
                {"key": "D", "text": self.option_d},
            ],
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }
        if include_answer:
            payload["correct_option"] = self.correct_option
        return payload


class TriviaAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trivia_id = db.Column(db.Integer, db.ForeignKey("trivia_question.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    selected_option = db.Column(db.String(1), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    points_awarded = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utcnow)


class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey("match.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    points = db.Column(db.Integer, default=0)
    correct_ball_predictions = db.Column(db.Integer, default=0)
    correct_over_predictions = db.Column(db.Integer, default=0)
    correct_trivia = db.Column(db.Integer, default=0)
    correct_drs_predictions = db.Column(db.Integer, default=0)
    reactions_count = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    user = db.relationship("User", backref="leaderboard_entries")

    __table_args__ = (db.UniqueConstraint("match_id", "user_id", name="unique_match_user_leaderboard"),)

    def to_dict(self):
        return {
            "id": self.id,
            "match_id": self.match_id,
            "user_id": self.user_id,
            "nickname": self.user.nickname if self.user else "Fan",
            "favorite_team": self.user.favorite_team if self.user else "",
            "points": self.points,
            "correct_ball_predictions": self.correct_ball_predictions,
            "correct_over_predictions": self.correct_over_predictions,
            "correct_trivia": self.correct_trivia,
            "correct_drs_predictions": self.correct_drs_predictions,
            "reactions_count": self.reactions_count,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
