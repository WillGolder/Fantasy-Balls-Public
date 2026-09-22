import fs from "fs";
import path from "path";
import type { SeasonData } from "./types";
import {
  getSeasonData,
  getAvailableYears,
  getAllSeasons,
  getHeadToHeadRecordsDetailed,
  getSeasonPowerRankings,
  getAllPlayTable,
  weeklyScores,
  teamPointsFor,
} from "./data";
import { ownerDisplayName } from "./owners";

export type DeskConfig = {
  sport: "football" | "baseball";
  year: number;
  gotwLast: string[];
  gotwNext: string[];
  youtube: string;
  notes: string;
};

export function getDeskConfig(): DeskConfig {
  const p = path.join(process.cwd(), "content", "desk.json");
  const fallback: DeskConfig = {
    sport: "football",
    year: new Date().getFullYear(),
    gotwLast: [],
    gotwNext: [],
    youtube: "",
    notes: "",
  };
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(p, "utf-8")) };
  } catch {
    return fallback;
  }
}

export type WeekGame = {
  week: number;
  homeId: number;
  awayId: number;
  homeTeam: string;
  awayTeam: string;
  homeOwner: string;
  awayOwner: string;
  homeScore: number;
  awayScore: number;
  margin: number;
  winnerOwner: string | null;
};

export function getWeekGames(season: SeasonData): WeekGame[] {
  const ownerOf = new Map<number, string>();
  const teamOf = new Map<number, string>();
  for (const t of season.teams) {
    ownerOf.set(t.team_id, ownerDisplayName(t));
    teamOf.set(t.team_id, t.team_name);
  }
  const dated = season.matchups.some(
    (m) => m.matchup_period != null || m.scoring_period != null
  );
  const games: WeekGame[] = [];
  if (dated) {
    for (const m of season.matchups) {
      const w = (m.matchup_period ?? m.scoring_period) as number;
      if (w == null || m.home_team_id == null || m.away_team_id == null) continue;
      if (m.home_score == null || m.away_score == null) continue;
      if (m.home_score === 0 && m.away_score === 0) continue;
      const flag = String(m.winner || "").toUpperCase();
      if (flag === "UNDECIDED" || flag === "PENDING") continue;
      const margin = Math.abs(m.home_score - m.away_score);
      let winner: string | null = null;
      if (m.home_score > m.away_score) winner = ownerOf.get(m.home_team_id) || null;
      else if (m.away_score > m.home_score) winner = ownerOf.get(m.away_team_id) || null;
      games.push({
        week: w,
        homeId: m.home_team_id,
        awayId: m.away_team_id,
        homeTeam: teamOf.get(m.home_team_id) || "",
        awayTeam: teamOf.get(m.away_team_id) || "",
        homeOwner: ownerOf.get(m.home_team_id) || "",
        awayOwner: ownerOf.get(m.away_team_id) || "",
        homeScore: m.home_score,
        awayScore: m.away_score,
        margin,
        winnerOwner: winner,
      });
    }
  } else {
    let week = 1;
    const seen = new Set<number>();
    let bucket: WeekGame[] = [];
    const flush = () => {
      if (bucket.some((g) => g.homeScore !== 0 || g.awayScore !== 0)) {
        games.push(...bucket.map((g) => ({ ...g, week })));
      }
      week += 1;
      bucket = [];
      seen.clear();
    };
    for (const m of season.matchups) {
      if (m.home_team_id == null || m.away_team_id == null) continue;
      if (seen.has(m.home_team_id) || seen.size >= season.teams.length) flush();
      seen.add(m.home_team_id);
      seen.add(m.away_team_id);
      const hs = m.home_score ?? 0;
      const as = m.away_score ?? 0;
      let winner: string | null = null;
      if (hs > as) winner = ownerOf.get(m.home_team_id) || null;
      else if (as > hs) winner = ownerOf.get(m.away_team_id) || null;
      bucket.push({
        week,
        homeId: m.home_team_id,
        awayId: m.away_team_id,
        homeTeam: teamOf.get(m.home_team_id) || "",
        awayTeam: teamOf.get(m.away_team_id) || "",
        homeOwner: ownerOf.get(m.home_team_id) || "",
        awayOwner: ownerOf.get(m.away_team_id) || "",
        homeScore: hs,
        awayScore: as,
        margin: Math.abs(hs - as),
        winnerOwner: winner,
      });
    }
    flush();
  }
  return games.filter((g) => !(g.homeScore === 0 && g.awayScore === 0));
}

export type LuckRow = {
  ownerName: string;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  allPlayW: number;
  allPlayL: number;
  allPlayT: number;
  expectedWins: number;
  luck: number;
};

export function getLuckTable(
  sport: "football" | "baseball",
  year: number
): LuckRow[] {
  const season = getSeasonData(sport, year);
  if (!season) return [];
  const allPlay = getAllPlayTable(sport, year);
  const n = Math.max(season.teams.length - 1, 1);
  return season.teams
    .map((t) => {
      const ownerName = ownerDisplayName(t);
      const ap = allPlay.rows.find((r) => r.teamId === t.team_id);
      const allPlayW = ap?.total.wins ?? 0;
      const allPlayL = ap?.total.losses ?? 0;
      const allPlayT = ap?.total.ties ?? 0;
      const expectedWins = allPlayW / n;
      return {
        ownerName,
        teamName: t.team_name,
        wins: t.wins || 0,
        losses: t.losses || 0,
        ties: t.ties || 0,
        allPlayW,
        allPlayL,
        allPlayT,
        expectedWins,
        luck: (t.wins || 0) - expectedWins,
      };
    })
    .sort((a, b) => b.luck - a.luck);
}

export type ScoreEcho = {
  score: number;
  owner: string;
  team: string;
  year: number;
  sport: string;
};

export function getHistoricalScores(sport: "football" | "baseball"): ScoreEcho[] {
  const out: ScoreEcho[] = [];
  for (const season of getAllSeasons(sport)) {
    const ownerOf = new Map(season.teams.map((t) => [t.team_id, ownerDisplayName(t)]));
    const teamOf = new Map(season.teams.map((t) => [t.team_id, t.team_name]));
    for (const m of season.matchups) {
      if (m.home_team_id != null && m.home_score) {
        out.push({
          score: m.home_score,
          owner: ownerOf.get(m.home_team_id) || "",
          team: teamOf.get(m.home_team_id) || "",
          year: season.year,
          sport: season.sport,
        });
      }
      if (m.away_team_id != null && m.away_score) {
        out.push({
          score: m.away_score,
          owner: ownerOf.get(m.away_team_id) || "",
          team: teamOf.get(m.away_team_id) || "",
          year: season.year,
          sport: season.sport,
        });
      }
    }
  }
  return out.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
}

export function scoreRank(sport: "football" | "baseball", score: number): number {
  const all = getHistoricalScores(sport);
  return all.filter((s) => s.score > score).length + 1;
}

export type CloseLedger = {
  ownerName: string;
  closeW: number;
  closeL: number;
  close5W: number;
  close5L: number;
};

export function getCloseLedger(season: SeasonData): CloseLedger[] {
  const map = new Map<string, CloseLedger>();
  const bump = (name: string) => {
    if (!map.has(name))
      map.set(name, { ownerName: name, closeW: 0, closeL: 0, close5W: 0, close5L: 0 });
    return map.get(name)!;
  };
  for (const g of getWeekGames(season)) {
    if (!g.winnerOwner) continue;
    const loser = g.winnerOwner === g.homeOwner ? g.awayOwner : g.homeOwner;
    if (g.margin <= 10) {
      bump(g.winnerOwner).closeW += 1;
      bump(loser).closeL += 1;
    }
    if (g.margin <= 5) {
      bump(g.winnerOwner).close5W += 1;
      bump(loser).close5L += 1;
    }
  }
  return [...map.values()];
}

export type ChugWeek = { week: number; owner: string; team: string; score: number };

export function getChugLog(season: SeasonData): ChugWeek[] {
  const byWeek = weeklyScores(season);
  const ownerOf = new Map(season.teams.map((t) => [t.team_id, ownerDisplayName(t)]));
  const teamOf = new Map(season.teams.map((t) => [t.team_id, t.team_name]));
  const out: ChugWeek[] = [];
  for (const [week, scores] of [...byWeek.entries()].sort((a, b) => a[0] - b[0])) {
    let low: { id: number; score: number } | null = null;
    for (const [id, score] of scores) {
      if (!low || score < low.score) low = { id, score };
    }
    if (low)
      out.push({
        week,
        owner: ownerOf.get(low.id) || "",
        team: teamOf.get(low.id) || "",
        score: low.score,
      });
  }
  return out;
}

export function getUpcomingOpponents(season: SeasonData, teamId: number, n = 3) {
  const games = season.matchups.filter(
    (m) =>
      (m.home_team_id === teamId || m.away_team_id === teamId) &&
      (m.home_score === 0 || m.home_score == null) &&
      (m.away_score === 0 || m.away_score == null)
  );
  const ownerOf = new Map(season.teams.map((t) => [t.team_id, ownerDisplayName(t)]));
  const teamOf = new Map(season.teams.map((t) => [t.team_id, t.team_name]));
  const pfOf = new Map(season.teams.map((t) => [t.team_id, teamPointsFor(season, t)]));
  const out: { owner: string; team: string; pf: number }[] = [];
  for (const m of games) {
    const oid = m.home_team_id === teamId ? m.away_team_id : m.home_team_id;
    if (oid == null) continue;
    out.push({
      owner: ownerOf.get(oid) || "",
      team: teamOf.get(oid) || "",
      pf: pfOf.get(oid) || 0,
    });
    if (out.length >= n) break;
  }
  return out;
}

export type PowerJump = {
  ownerName: string;
  teamName: string;
  rank: number;
  prev: number | null;
  delta: number | null;
  recordRank: number;
};

export function getPowerJumps(
  sport: "football" | "baseball",
  year: number
): PowerJump[] {
  const power = getSeasonPowerRankings(sport, year);
  const season = getSeasonData(sport, year);
  let snap: Record<string, number> = {};
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "content", "power-snap.json"), "utf-8")
    );
    snap = raw[`${sport}-${year}`]?.ranks || {};
  } catch {
    snap = {};
  }
  const recordOrder = [...(season?.teams || [])].sort((a, b) => {
    const ag = (a.wins || 0) + (a.losses || 0);
    const bg = (b.wins || 0) + (b.losses || 0);
    const ap = ag ? (a.wins || 0) / ag : 0;
    const bp = bg ? (b.wins || 0) / bg : 0;
    if (bp !== ap) return bp - ap;
    return teamPointsFor(season!, b) - teamPointsFor(season!, a);
  });
  return power.map((p) => {
    const prev = snap[p.ownerName] ?? snap[p.teamName] ?? null;
    const recordRank = recordOrder.findIndex((t) => ownerDisplayName(t) === p.ownerName) + 1;
    return {
      ownerName: p.ownerName,
      teamName: p.teamName,
      rank: p.rank,
      prev,
      delta: prev != null ? prev - p.rank : null,
      recordRank: recordRank || p.rank,
    };
  });
}

export function chalkFavorite(game: WeekGame, luck: LuckRow[]) {
  const a = luck.find((l) => l.ownerName === game.homeOwner);
  const b = luck.find((l) => l.ownerName === game.awayOwner);
  const aScore = (a?.allPlayW || 0) + (game.homeScore || 0);
  const bScore = (b?.allPlayW || 0) + (game.awayScore || 0);
  if (aScore === bScore) return null;
  return aScore > bScore ? game.homeOwner : game.awayOwner;
}
