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


export type GotwWeek = { week: number; a: string; b: string };

export function getGotwWeeks(): { sport: "football" | "baseball"; year: number; weeks: GotwWeek[] } {
  const fallback = {
    sport: "football" as const,
    year: 2026,
    weeks: Array.from({ length: 14 }, (_, i) => ({ week: i + 1, a: "", b: "" })),
  };
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "content", "gotw.json"), "utf-8")
    );
    const weeks: GotwWeek[] = fallback.weeks.map((slot) => {
      const found = (raw.weeks || []).find((w: GotwWeek) => w.week === slot.week);
      return found ? { week: slot.week, a: found.a || "", b: found.b || "" } : slot;
    });
    return { sport: raw.sport || "football", year: raw.year || 2026, weeks };
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
  week: number | null;
};

export function getHistoricalScores(sport: "football" | "baseball"): ScoreEcho[] {
  const out: ScoreEcho[] = [];
  const seenMatchup = new Set<string>();
  const seenScore = new Set<string>();

  for (const season of getAllSeasons(sport)) {
    // 2022 football scoring scale does not match later years
    if (season.sport === "football" && season.year === 2022) continue;
    const ownerOf = new Map(season.teams.map((t) => [t.team_id, ownerDisplayName(t)]));
    const teamOf = new Map(season.teams.map((t) => [t.team_id, t.team_name]));

    for (const m of season.matchups) {
      if (m.home_team_id == null || m.away_team_id == null) continue;
      const week = m.matchup_period ?? m.scoring_period ?? null;
      const hs = m.home_score ?? 0;
      const as = m.away_score ?? 0;
      // Drop duplicate ESPN rows (same teams/week/scores stored more than once)
      const mk = [
        season.year,
        week ?? "x",
        Math.min(m.home_team_id, m.away_team_id),
        Math.max(m.home_team_id, m.away_team_id),
        Number(hs).toFixed(2),
        Number(as).toFixed(2),
      ].join("|");
      if (seenMatchup.has(mk)) continue;
      seenMatchup.add(mk);

      for (const [tid, score] of [
        [m.home_team_id, hs],
        [m.away_team_id, as],
      ] as const) {
        if (!score || score <= 0) continue;
        const sk = `${season.year}|${week ?? "x"}|${tid}|${Number(score).toFixed(2)}`;
        if (seenScore.has(sk)) continue;
        seenScore.add(sk);
        out.push({
          score,
          owner: ownerOf.get(tid) || "",
          team: teamOf.get(tid) || "",
          year: season.year,
          sport: season.sport,
          week,
        });
      }
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

export function scoreRank(sport: "football" | "baseball", score: number): number {
  const all = getHistoricalScores(sport);
  return all.filter((s) => s.score > score).length + 1;
}

export function getScoreAppearances(
  sport: "football" | "baseball",
  topN = 100,
  bottomN = 50
): { owner: string; top: number; bottom: number; total: number }[] {
  const all = getHistoricalScores(sport);
  const top = all.slice(0, topN);
  const bottom = [...all].reverse().slice(0, bottomN);
  const map = new Map<string, { owner: string; top: number; bottom: number; total: number }>();
  const bump = (owner: string) => {
    if (!map.has(owner)) map.set(owner, { owner, top: 0, bottom: 0, total: 0 });
    return map.get(owner)!;
  };
  for (const s of all) bump(s.owner).total += 1;
  for (const s of top) bump(s.owner).top += 1;
  for (const s of bottom) bump(s.owner).bottom += 1;
  return [...map.values()].sort((a, b) => b.top - a.top || b.bottom - a.bottom);
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
  const recOf = new Map(
    season.teams.map((t) => {
      const g = (t.wins || 0) + (t.losses || 0) + (t.ties || 0);
      return [t.team_id, { wins: t.wins || 0, losses: t.losses || 0, winPct: g ? (t.wins || 0) / g : 0 }];
    })
  );
  const out: {
    owner: string;
    team: string;
    pf: number;
    wins: number;
    losses: number;
    winPct: number;
  }[] = [];
  for (const m of games) {
    const oid = m.home_team_id === teamId ? m.away_team_id : m.home_team_id;
    if (oid == null) continue;
    const rec = recOf.get(oid) || { wins: 0, losses: 0, winPct: 0 };
    out.push({
      owner: ownerOf.get(oid) || "",
      team: teamOf.get(oid) || "",
      pf: pfOf.get(oid) || 0,
      wins: rec.wins,
      losses: rec.losses,
      winPct: rec.winPct,
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

export type GotwCandidate = {
  category: "race" | "history" | "form" | "fresh";
  ownerA: string;
  ownerB: string;
  week: number | null;
  reason: string;
};

/** Upcoming 0–0 matchups sorted into GOTW story buckets. Same pair can appear in multiple categories. */
export function getGotwCandidates(
  sport: "football" | "baseball",
  year: number,
  limitPerCat = 4
): { week: number | null; categories: Record<GotwCandidate["category"], GotwCandidate[]> } {
  const season = getSeasonData(sport, year);
  const empty = {
    week: null as number | null,
    categories: { race: [], history: [], form: [], fresh: [] } as Record<
      GotwCandidate["category"],
      GotwCandidate[]
    >,
  };
  if (!season) return empty;

  const ownerOf = new Map(season.teams.map((t) => [t.team_id, ownerDisplayName(t)]));
  const teamByOwner = new Map(season.teams.map((t) => [ownerDisplayName(t), t]));

  // Prefer the soonest week that still has unscored games
  const pending = season.matchups.filter(
    (m) =>
      m.home_team_id != null &&
      m.away_team_id != null &&
      (m.home_score === 0 || m.home_score == null) &&
      (m.away_score === 0 || m.away_score == null)
  );
  if (!pending.length) return empty;

  const weeks = [
    ...new Set(
      pending
        .map((m) => (m.matchup_period ?? m.scoring_period) as number | null)
        .filter((w): w is number => w != null)
    ),
  ].sort((a, b) => a - b);
  const targetWeek = weeks[0] ?? null;
  const slate = pending.filter((m) => {
    const w = (m.matchup_period ?? m.scoring_period) as number | null;
    return targetWeek == null || w === targetWeek;
  });

  const h2h = getHeadToHeadRecordsDetailed();
  const h2hKey = (a: string, b: string) => [a, b].sort().join("__");
  const h2hMap = new Map(h2h.map((r) => [h2hKey(r.ownerA, r.ownerB), r]));

  const featured = new Set<string>();
  for (const w of getGotwWeeks().weeks) {
    if (w.a) featured.add(w.a.toLowerCase());
    if (w.b) featured.add(w.b.toLowerCase());
  }

  const standings = [...season.teams].sort((a, b) => {
    const ag = (a.wins || 0) + (a.losses || 0) + (a.ties || 0);
    const bg = (b.wins || 0) + (b.losses || 0) + (b.ties || 0);
    const ap = ag ? (a.wins || 0) / ag : 0;
    const bp = bg ? (b.wins || 0) / bg : 0;
    if (bp !== ap) return bp - ap;
    return (b.points_for || 0) - (a.points_for || 0);
  });
  const rankOf = new Map(standings.map((t, i) => [ownerDisplayName(t), i + 1]));
  const n = standings.length || 10;
  const playoffCut = Math.min(6, Math.ceil(n * 0.6));

  type Pair = { a: string; b: string; week: number | null };
  const pairs: Pair[] = [];
  const seen = new Set<string>();
  for (const m of slate) {
    const a = ownerOf.get(m.home_team_id!) || "";
    const b = ownerOf.get(m.away_team_id!) || "";
    if (!a || !b) continue;
    const k = h2hKey(a, b);
    if (seen.has(k)) continue;
    seen.add(k);
    pairs.push({
      a,
      b,
      week: (m.matchup_period ?? m.scoring_period) as number | null,
    });
  }

  const race: GotwCandidate[] = [];
  const history: GotwCandidate[] = [];
  const form: GotwCandidate[] = [];
  const fresh: GotwCandidate[] = [];

  for (const p of pairs) {
    const ra = rankOf.get(p.a) || 99;
    const rb = rankOf.get(p.b) || 99;
    const ta = teamByOwner.get(p.a);
    const tb = teamByOwner.get(p.b);
    const recA = `${ta?.wins || 0}-${ta?.losses || 0}`;
    const recB = `${tb?.wins || 0}-${tb?.losses || 0}`;

    // Race: both near cut, or adjacent ranks, or both bottom 3
    const bothBubble =
      (ra <= playoffCut + 1 && rb <= playoffCut + 1) ||
      (ra >= n - 2 && rb >= n - 2) ||
      Math.abs(ra - rb) <= 2;
    if (bothBubble) {
      let reason = `Seeds #${ra} (${recA}) vs #${rb} (${recB}).`;
      if (ra <= playoffCut && rb <= playoffCut) {
        reason = `Both inside the top ${playoffCut} cut — ${recA} vs ${recB}.`;
      } else if (ra >= n - 2 && rb >= n - 2) {
        reason = `Toilet-bowl stakes — both near last (${recA} vs ${recB}).`;
      } else if (
        (ra <= playoffCut && rb === playoffCut + 1) ||
        (rb <= playoffCut && ra === playoffCut + 1)
      ) {
        reason = `Playoff-line game — one in, one just out (${recA} vs ${recB}).`;
      }
      race.push({
        category: "race",
        ownerA: p.a,
        ownerB: p.b,
        week: p.week,
        reason,
      });
    }

    // History
    const series = h2hMap.get(h2hKey(p.a, p.b));
    if (series && series.totalGames >= 3) {
      const gap = Math.abs(series.winsA - series.winsB);
      const close = gap <= 2;
      const droughtA = series.ownerA === p.a ? series.winsA === 0 : series.winsB === 0;
      const droughtB = series.ownerA === p.b ? series.winsA === 0 : series.winsB === 0;
      if (close || droughtA || droughtB) {
        const aIsA = series.ownerA === p.a;
        const aw = aIsA ? series.winsA : series.winsB;
        const bw = aIsA ? series.winsB : series.winsA;
        let reason = `All-time series ${aw}–${bw} over ${series.totalGames} games.`;
        if (droughtA) reason = `${p.a.split(" ")[0]} is 0–${bw} all-time in this series (${series.totalGames} games).`;
        if (droughtB) reason = `${p.b.split(" ")[0]} is 0–${aw} all-time in this series (${series.totalGames} games).`;
        if (close && !droughtA && !droughtB) {
          reason = `Tight series ${aw}–${bw} (${series.totalGames} games).`;
        }
        history.push({
          category: "history",
          ownerA: p.a,
          ownerB: p.b,
          week: p.week,
          reason,
        });
      }
    }

    // Form — close PPG
    const pfA = ta ? teamPointsFor(season, ta) : 0;
    const pfB = tb ? teamPointsFor(season, tb) : 0;
    const gamesA = (ta?.wins || 0) + (ta?.losses || 0) + (ta?.ties || 0) || 1;
    const gamesB = (tb?.wins || 0) + (tb?.losses || 0) + (tb?.ties || 0) || 1;
    const ppgA = pfA / gamesA;
    const ppgB = pfB / gamesB;
    if (Math.abs(ppgA - ppgB) <= 8 && (ppgA > 0 || ppgB > 0)) {
      form.push({
        category: "form",
        ownerA: p.a,
        ownerB: p.b,
        week: p.week,
        reason: `Season PPG nearly even — ${ppgA.toFixed(1)} vs ${ppgB.toFixed(1)}.`,
      });
    }

    // Fresh — neither in GOTW tracker yet
    const aFeat = featured.has(p.a.toLowerCase());
    const bFeat = featured.has(p.b.toLowerCase());
    if (!aFeat || !bFeat) {
      let reason = "Neither manager has been GOTW yet this year.";
      if (!aFeat && bFeat) reason = `${p.a.split(" ")[0]} has not been GOTW yet this year.`;
      if (aFeat && !bFeat) reason = `${p.b.split(" ")[0]} has not been GOTW yet this year.`;
      if (!aFeat && !bFeat) reason = "Neither side has been featured in GOTW yet this year.";
      fresh.push({
        category: "fresh",
        ownerA: p.a,
        ownerB: p.b,
        week: p.week,
        reason,
      });
    }
  }

  return {
    week: targetWeek,
    categories: {
      race: race.slice(0, limitPerCat),
      history: history.slice(0, limitPerCat),
      form: form.slice(0, limitPerCat),
      fresh: fresh.slice(0, limitPerCat),
    },
  };
}
