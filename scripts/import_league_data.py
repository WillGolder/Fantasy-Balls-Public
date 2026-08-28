#!/usr/bin/env python3
"""
Fantasy Balls - ESPN League History Importer
Pulls historical data for Football (225969362) and Baseball (1126511192)
and saves it as structured JSON for permanent archiving.
"""

import json
import os
from datetime import datetime
from pathlib import Path

from espn_api.football import League as FootballLeague
from espn_api.baseball import League as BaseballLeague

# ============== CONFIG ==============
FOOTBALL_LEAGUE_ID = 225969362
BASEBALL_LEAGUE_ID = 1126511192

# Years to pull
FOOTBALL_YEARS = [2022, 2023, 2024, 2025, 2026]
BASEBALL_YEARS = [2023, 2024, 2025, 2026]          # 2022 does not exist under this league ID

# Cookies for restricted seasons (keep private)
ESPN_S2 = os.environ.get("ESPN_S2", "")
SWID = os.environ.get("SWID", "")

OUTPUT_DIR = Path(__file__).parent.parent / "data"
# ====================================


def team_to_dict(team):
    """Convert an ESPN Team object into a clean dictionary.
    Works for both football and baseball (attributes differ slightly).
    """
    owners = []
    for o in (team.owners or []):
        if isinstance(o, dict):
            owners.append({
                "displayName": o.get("displayName"),
                "firstName": o.get("firstName"),
                "lastName": o.get("lastName"),
                "id": o.get("id"),
            })
        else:
            owners.append(str(o))

    # points_for / points_against exist on football teams but not baseball
    points_for = getattr(team, "points_for", None)
    points_against = getattr(team, "points_against", None)

    return {
        "team_id": team.team_id,
        "team_name": team.team_name,
        "team_abbrev": getattr(team, "team_abbrev", None),
        "owners": owners,
        "wins": team.wins,
        "losses": team.losses,
        "ties": getattr(team, "ties", 0),
        "points_for": round(points_for, 2) if points_for is not None else None,
        "points_against": round(points_against, 2) if points_against is not None else None,
        "standing": getattr(team, "standing", None),
        "final_standing": getattr(team, "final_standing", None),
        "playoff_pct": getattr(team, "playoff_pct", None),
        "streak_type": getattr(team, "streak_type", None),
        "streak_length": getattr(team, "streak_length", None),
        "logo_url": getattr(team, "logo_url", None),
        "division_id": getattr(team, "division_id", None),
        "division_name": getattr(team, "division_name", None),
    }


def matchup_to_dict(matchup):
    """Convert a Matchup / BoxScore object into a clean dictionary.
    Handles both football (home_score) and baseball (home_final_score) styles.
    """
    data = {
        "matchup_period": getattr(matchup, "matchup_period", None) or getattr(matchup, "matchupPeriodId", None),
        "scoring_period": getattr(matchup, "scoring_period", None),
    }

    # Home team
    home = getattr(matchup, "home_team", None)
    if home:
        data["home_team_id"] = home.team_id
        data["home_team_name"] = home.team_name
    else:
        data["home_team_id"] = None
        data["home_team_name"] = None

    # Score fields differ between sports
    home_score = getattr(matchup, "home_score", None)
    if home_score is None:
        home_score = getattr(matchup, "home_final_score", None)
    data["home_score"] = round(home_score, 2) if home_score is not None else None

    # Away team
    away = getattr(matchup, "away_team", None)
    if away:
        data["away_team_id"] = away.team_id
        data["away_team_name"] = away.team_name
    else:
        data["away_team_id"] = None
        data["away_team_name"] = None

    away_score = getattr(matchup, "away_score", None)
    if away_score is None:
        away_score = getattr(matchup, "away_final_score", None)
    data["away_score"] = round(away_score, 2) if away_score is not None else None

    data["winner"] = getattr(matchup, "winner", None)
    data["is_playoff"] = getattr(matchup, "is_playoff", False)
    data["is_consolation"] = getattr(matchup, "is_consolation", False)

    return data


def pull_football_season(year: int) -> dict:
    """Pull a full football season and return structured data."""
    print(f"  Pulling Football {year}...")
    kwargs = {"league_id": FOOTBALL_LEAGUE_ID, "year": year}
    if ESPN_S2 and SWID:
        kwargs["espn_s2"] = ESPN_S2
        kwargs["swid"] = SWID

    league = FootballLeague(**kwargs)

    # Basic info
    settings = {
        "name": getattr(league.settings, "name", None),
        "scoring_type": getattr(league.settings, "scoring_type", None),
        "reg_season_count": getattr(league.settings, "reg_season_count", None),
        "playoff_team_count": getattr(league.settings, "playoff_team_count", None),
        "veto_votes_required": getattr(league.settings, "veto_votes_required", None),
        "team_count": len(league.teams),
    }

    teams = [team_to_dict(t) for t in league.teams]

    # Matchups – try every week that exists
    matchups = []
    max_week = getattr(league, "current_week", 18) or 18
    for week in range(1, max_week + 1):
        try:
            box_scores = league.box_scores(week)
            for bs in box_scores:
                matchups.append(matchup_to_dict(bs))
        except Exception:
            # Week may not exist yet or data missing
            continue

    # Draft (if available)
    draft = []
    try:
        for pick in league.draft:
            draft.append({
                "round": getattr(pick, "round_num", None),
                "pick": getattr(pick, "round_pick", None),
                "overall": getattr(pick, "overall_pick", None),
                "player_name": getattr(pick.player, "name", None) if hasattr(pick, "player") else getattr(pick, "playerName", None),
                "player_id": getattr(pick, "playerId", None),
                "team_id": getattr(pick, "team", None).team_id if getattr(pick, "team", None) else None,
                "team_name": getattr(pick, "team", None).team_name if getattr(pick, "team", None) else None,
            })
    except Exception as e:
        print(f"    (Draft data not available: {e})")

    return {
        "sport": "football",
        "league_id": FOOTBALL_LEAGUE_ID,
        "year": year,
        "pulled_at": datetime.now().isoformat() + "Z",
        "settings": settings,
        "teams": teams,
        "matchups": matchups,
        "draft": draft,
    }


def pull_baseball_season(year: int) -> dict:
    """Pull a full baseball season and return structured data."""
    print(f"  Pulling Baseball {year}...")
    kwargs = {"league_id": BASEBALL_LEAGUE_ID, "year": year}
    if ESPN_S2 and SWID:
        kwargs["espn_s2"] = ESPN_S2
        kwargs["swid"] = SWID

    league = BaseballLeague(**kwargs)

    settings = {
        "name": getattr(league.settings, "name", None),
        "scoring_type": getattr(league.settings, "scoring_type", None),
        "team_count": len(league.teams),
    }

    teams = [team_to_dict(t) for t in league.teams]

    # Matchups – pull each known matchup period
    matchups = []
    current_period = getattr(league, "currentMatchupPeriod", 25) or 25
    for period in range(1, current_period + 1):
        try:
            scoreboard = league.scoreboard(matchupPeriod=period)
            for m in scoreboard:
                md = matchup_to_dict(m)
                md["matchup_period"] = period
                matchups.append(md)
        except Exception:
            continue

    draft = []
    try:
        for pick in league.draft:
            draft.append({
                "round": getattr(pick, "round_num", None),
                "pick": getattr(pick, "round_pick", None),
                "overall": getattr(pick, "overall_pick", None),
                "player_name": getattr(pick.player, "name", None) if hasattr(pick, "player") else None,
                "team_id": getattr(pick, "team", None).team_id if getattr(pick, "team", None) else None,
                "team_name": getattr(pick, "team", None).team_name if getattr(pick, "team", None) else None,
            })
    except Exception as e:
        print(f"    (Draft data not available: {e})")

    return {
        "sport": "baseball",
        "league_id": BASEBALL_LEAGUE_ID,
        "year": year,
        "pulled_at": datetime.now().isoformat() + "Z",
        "settings": settings,
        "teams": teams,
        "matchups": matchups,
        "draft": draft,
    }


def save_season(data: dict, sport: str):
    """Save a season's data to a JSON file."""
    year = data["year"]
    out_dir = OUTPUT_DIR / sport
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{year}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"    Saved → {path}")


def main():
    print("=" * 60)
    print("Fantasy Balls – Historical Data Importer")
    print(f"Run at: {datetime.now().isoformat()}")
    print("=" * 60)

    # Football
    print("\n[Football]")
    for year in FOOTBALL_YEARS:
        try:
            data = pull_football_season(year)
            save_season(data, "football")
            print(f"    ✓ {year}: {len(data['teams'])} teams, {len(data['matchups'])} matchups, {len(data['draft'])} draft picks")
        except Exception as e:
            print(f"    ✗ {year} failed: {e}")

    # Baseball
    print("\n[Baseball]")
    for year in BASEBALL_YEARS:
        try:
            data = pull_baseball_season(year)
            save_season(data, "baseball")
            print(f"    ✓ {year}: {len(data['teams'])} teams, {len(data['matchups'])} matchups, {len(data['draft'])} draft picks")
        except Exception as e:
            print(f"    ✗ {year} failed: {e}")

    print("\n" + "=" * 60)
    print("Done. Data is locked down in the /data folder.")
    print("When you have espn_s2 + SWID cookies, add them to the script")
    print("and re-run to capture the remaining seasons.")
    print("=" * 60)


if __name__ == "__main__":
    main()
