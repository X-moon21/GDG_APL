import os

if os.getenv("SOCKETIO_ASYNC_MODE", "eventlet") == "eventlet":
    os.environ.setdefault("EVENTLET_NO_GREENDNS", "yes")
    import eventlet

    eventlet.monkey_patch()

from app import create_app
from extensions import db
from models import Match


def seed_demo_data():
    app = create_app(register_events=False)
    with app.app_context():
        db.drop_all()
        db.create_all()

        match = Match(
            id=1,
            team_a="India",
            team_b="Australia",
            batting_team="India",
            bowling_team="Australia",
            runs=142,
            wickets=4,
            overs=15,
            balls=3,
            target=181,
            innings=2,
            status="live",
            current_batsman="Rohit Sharma",
            non_striker="Hardik Pandya",
            current_bowler="Pat Cummins",
        )
        match.set_last_balls(["1", "4", "0", "W", "2", "6"])

        db.session.add(match)
        db.session.commit()
        print("Seeded FanPulse Cricket demo match: India vs Australia")


if __name__ == "__main__":
    seed_demo_data()
