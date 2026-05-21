import os

SOCKETIO_ASYNC_MODE = os.getenv("SOCKETIO_ASYNC_MODE", "eventlet")

if SOCKETIO_ASYNC_MODE == "eventlet":
    os.environ.setdefault("EVENTLET_NO_GREENDNS", "yes")
    import eventlet

    eventlet.monkey_patch()

from flask import Flask, jsonify, request

from config import Config
from extensions import cors, db, socketio
from models import Match, User
from scoring import JOIN_POINTS, get_or_create_leaderboard, leaderboard_payload


def create_app(register_events=True):
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
    socketio.init_app(
        app,
        cors_allowed_origins=Config.CORS_ORIGINS,
        async_mode=Config.SOCKETIO_ASYNC_MODE,
        transports=Config.SOCKETIO_TRANSPORTS,
    )

    with app.app_context():
        db.create_all()

    if register_events:
        from socket_events import register_socket_events

        register_socket_events(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "FanPulse Cricket"})

    @app.get("/api/matches")
    def get_matches():
        matches = Match.query.order_by(Match.created_at.desc()).all()
        return jsonify([match.to_dict() for match in matches])

    @app.get("/api/matches/<int:match_id>")
    def get_match(match_id):
        match = Match.query.get_or_404(match_id)
        return jsonify(match.to_dict())

    @app.post("/api/users")
    def create_user():
        payload = request.get_json(silent=True) or {}
        nickname = (payload.get("nickname") or "Fan").strip()[:80]
        favorite_team = (payload.get("favorite_team") or "India").strip()[:80]
        match_id = int(payload.get("match_id", 1))

        user = User(nickname=nickname, favorite_team=favorite_team)
        db.session.add(user)
        db.session.flush()

        entry = get_or_create_leaderboard(match_id, user.id)
        entry.points += JOIN_POINTS
        db.session.commit()

        from socket_events import emit_leaderboard

        emit_leaderboard(match_id)
        return jsonify({"user": user.to_dict(), "join_points": JOIN_POINTS}), 201

    @app.get("/api/leaderboard/<int:match_id>")
    def get_leaderboard(match_id):
        return jsonify(leaderboard_payload(match_id))

    @app.post("/api/seed")
    def seed():
        from seed import seed_demo_data

        seed_demo_data()
        return jsonify({"status": "seeded"})

    return app


app = create_app()


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    run_kwargs = {"host": "0.0.0.0", "port": 5000, "debug": debug}
    if app.config["SOCKETIO_ASYNC_MODE"] == "threading":
        run_kwargs["allow_unsafe_werkzeug"] = True
    socketio.run(app, **run_kwargs)
