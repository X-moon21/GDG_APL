from models import BallEvent


OUTCOME_MAP = {
    "dot": {"label": "0", "runs": 0, "legal": True, "is_wicket": False, "is_boundary": False, "is_extra": False},
    "1": {"label": "1", "runs": 1, "legal": True, "is_wicket": False, "is_boundary": False, "is_extra": False},
    "2": {"label": "2", "runs": 2, "legal": True, "is_wicket": False, "is_boundary": False, "is_extra": False},
    "3": {"label": "3", "runs": 3, "legal": True, "is_wicket": False, "is_boundary": False, "is_extra": False},
    "four": {"label": "4", "runs": 4, "legal": True, "is_wicket": False, "is_boundary": True, "is_extra": False},
    "six": {"label": "6", "runs": 6, "legal": True, "is_wicket": False, "is_boundary": True, "is_extra": False},
    "wicket": {"label": "W", "runs": 0, "legal": True, "is_wicket": True, "is_boundary": False, "is_extra": False},
    "wide": {"label": "Wd", "runs": 1, "legal": False, "is_wicket": False, "is_boundary": False, "is_extra": True},
    "no_ball": {"label": "Nb", "runs": 1, "legal": False, "is_wicket": False, "is_boundary": False, "is_extra": True},
}


def normalize_outcome(outcome):
    key = str(outcome or "dot").strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {
        "0": "dot",
        "dot_ball": "dot",
        "four": "four",
        "4": "four",
        "six": "six",
        "6": "six",
        "w": "wicket",
        "wide_no_ball": "wide",
        "noball": "no_ball",
        "no": "no_ball",
    }
    return aliases.get(key, key if key in OUTCOME_MAP else "dot")


def describe_event(match, outcome_key):
    batsman = match.current_batsman
    batting = match.batting_team
    descriptions = {
        "dot": "Dot ball. Pressure building.",
        "1": f"{batsman} nudges it into the gap for one.",
        "2": f"Good running from {batsman}. They come back for two.",
        "3": "Three runs! Excellent placement and hustle between the wickets.",
        "four": f"FOUR! {batsman} drives through covers.",
        "six": "SIX! Massive hit into the stands.",
        "wicket": f"WICKET! {match.bowling_team} strikes at a crucial moment.",
        "wide": f"Wide ball. Extra run for {batting}.",
        "no_ball": f"No ball. Free hit energy for {batting}.",
    }
    return descriptions[outcome_key]


def apply_ball(match, outcome):
    outcome_key = normalize_outcome(outcome)
    meta = OUTCOME_MAP[outcome_key]

    event_over = match.overs
    event_ball = match.balls + 1 if meta["legal"] else match.balls

    match.runs += meta["runs"]
    if meta["is_wicket"]:
        match.wickets += 1

    if meta["legal"]:
        match.balls += 1
        if match.balls >= 6:
            match.overs += 1
            match.balls = 0

    last_balls = match.get_last_balls()
    last_balls.append(meta["label"])
    match.set_last_balls(last_balls)

    if match.target and match.runs >= match.target:
        match.status = "completed"
    if match.wickets >= 10:
        match.status = "completed"

    event = BallEvent(
        match_id=match.id,
        over_number=event_over,
        ball_number=event_ball,
        outcome=outcome_key,
        runs=meta["runs"],
        is_wicket=meta["is_wicket"],
        is_boundary=meta["is_boundary"],
        is_extra=meta["is_extra"],
        description=describe_event(match, outcome_key),
    )
    return event, meta
