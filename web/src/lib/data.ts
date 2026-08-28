import fs from "fs";
import path from "path";

export type {
  Owner,
  Team,
  Matchup,
  SeasonData,
  OwnerCareer,
  HeadToHeadRecord,
} from "./types";
export { ownerKey, ownerDisplayName } from "./owners";
import type { Team, SeasonData, OwnerCareer, HeadToHeadRecord } from "./types";
import { ownerKey, ownerDisplayName } from "./owners";

const DATA_DIR = path.join(process.cwd(), "data");

export function getAvailableYears(sport: "football" | "baseball"): number[] {
  const dir = path.join(DATA_DIR, sport);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => parseInt(f.replace(".json", ""), 10))
    .filter((y) => !isNaN(y))
    .sort((a, b) => b - a);
}

export function getSeasonData(
  sport: "football" | "baseball",
  year: number
): SeasonData | null {
  const filePath = path.join(DATA_DIR, sport, `${year}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SeasonData;
}

export function getAllSeasons(sport: "football" | "baseball"): SeasonData[] {
  return getAvailableYears(sport)
    .map((year) => getSeasonData(sport, year))
    .filter((s): s is SeasonData => s !== null);
}

export function getAllSeasonsCombined(): SeasonData[] {
  return [...getAllSeasons("football"), ...getAllSeasons("baseball")].sort(
    (a, b) => b.year - a.year || a.sport.localeCompare(b.sport)
  );
}

/** Career stats for a single sport */
export function getOwnerCareerStats(sport: "football" | "baseball"): OwnerCareer[] {
  const seasons = getAllSeasons(sport);
  const map = new Map<string, OwnerCareer>();

  for (const season of seasons) {
    const champion = season.teams.find((t) => t.final_standing === 1) || null;

    for (const team of season.teams) {
      const key = ownerKey(team);
      const name = ownerDisplayName(team);

      if (!map.has(key)) {
        map.set(key, {
          key,
          displayName: name,
          seasons: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          championships: 0,
          footballSeasons: 0,
          baseballSeasons: 0,
          footballWins: 0,
          baseballWins: 0,
          footballChampionships: 0,
          baseballChampionships: 0,
        });
      }
      const rec = map.get(key)!;
      rec.seasons += 1;
      rec.wins += team.wins || 0;
      rec.losses += team.losses || 0;
      rec.ties += team.ties || 0;
      rec.pointsFor += team.points_for || 0;
      rec.pointsAgainst += team.points_against || 0;

      if (sport === "football") {
        rec.footballSeasons += 1;
        rec.footballWins += team.wins || 0;
      } else {
        rec.baseballSeasons += 1;
        rec.baseballWins += team.wins || 0;
      }

      if (champion && champion.team_id === team.team_id) {
        rec.championships += 1;
        if (sport === "football") rec.footballChampionships += 1;
        else rec.baseballChampionships += 1;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.wins - a.wins);
}

/** Combined career stats across both sports */
export function getCombinedOwnerCareerStats(): OwnerCareer[] {
  const football = getOwnerCareerStats("football");
  const baseball = getOwnerCareerStats("baseball");
  const map = new Map<string, OwnerCareer>();

  const merge = (list: OwnerCareer[]) => {
    for (const o of list) {
      if (!map.has(o.key)) {
        map.set(o.key, { ...o });
      } else {
        const existing = map.get(o.key)!;
        existing.seasons += o.seasons;
        existing.wins += o.wins;
        existing.losses += o.losses;
        existing.ties += o.ties;
        existing.pointsFor += o.pointsFor;
        existing.pointsAgainst += o.pointsAgainst;
        existing.championships += o.championships;
        existing.footballSeasons += o.footballSeasons;
        existing.baseballSeasons += o.baseballSeasons;
        existing.footballWins += o.footballWins;
        existing.baseballWins += o.baseballWins;
        existing.footballChampionships += o.footballChampionships;
        existing.baseballChampionships += o.baseballChampionships;
        // Prefer longer / more complete display name
        if (o.displayName.length > existing.displayName.length) {
          existing.displayName = o.displayName;
        }
      }
    }
  };

  merge(football);
  merge(baseball);

  // Apply manual championships (match by display name)
  for (const m of getManualChampionships()) {
    let found = false;
    for (const rec of map.values()) {
      if (rec.displayName === m.championOwner) {
        rec.championships += 1;
        if (m.sport === "football") rec.footballChampionships += 1;
        else rec.baseballChampionships += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      // create a minimal record so titles still show
      const key = `manual-${m.championOwner}`;
      map.set(key, {
        key,
        displayName: m.championOwner,
        seasons: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        championships: 1,
        footballSeasons: 0,
        baseballSeasons: 0,
        footballWins: 0,
        baseballWins: 0,
        footballChampionships: m.sport === "football" ? 1 : 0,
        baseballChampionships: m.sport === "baseball" ? 1 : 0,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.wins - a.wins);
}

/**
 * Build all-time head-to-head records between owners.
 * Uses matchup scores when available; falls back to winner field.
 * Only counts games where both sides have identifiable owners.
 */
export function getHeadToHeadRecords(
  sport?: "football" | "baseball"
): HeadToHeadRecord[] {
  const seasons = sport
    ? getAllSeasons(sport)
    : getAllSeasonsCombined();

  // Map team_id + year + sport → owner key / name for that season
  const teamOwnerLookup = new Map<string, { key: string; name: string }>();

  for (const season of seasons) {
    for (const team of season.teams) {
      const lookupKey = `${season.sport}-${season.year}-${team.team_id}`;
      teamOwnerLookup.set(lookupKey, {
        key: ownerKey(team),
        name: ownerDisplayName(team),
      });
    }
  }

  // Pair key → record (always store lower key first for consistency)
  const h2h = new Map<
    string,
    { nameA: string; nameB: string; winsA: number; winsB: number; ties: number }
  >();

  for (const season of seasons) {
    for (const m of season.matchups) {
      if (m.home_team_id == null || m.away_team_id == null) continue;

      const homeLookup = teamOwnerLookup.get(
        `${season.sport}-${season.year}-${m.home_team_id}`
      );
      const awayLookup = teamOwnerLookup.get(
        `${season.sport}-${season.year}-${m.away_team_id}`
      );
      if (!homeLookup || !awayLookup) continue;
      if (homeLookup.key === awayLookup.key) continue; // same owner (shouldn't happen)

      const homeScore = m.home_score;
      const awayScore = m.away_score;

      let homeWon = false;
      let awayWon = false;
      let isTie = false;

      if (homeScore != null && awayScore != null) {
        if (homeScore > awayScore) homeWon = true;
        else if (awayScore > homeScore) awayWon = true;
        else isTie = true;
      } else if (m.winner) {
        const w = String(m.winner).toUpperCase();
        if (w === "HOME") homeWon = true;
        else if (w === "AWAY") awayWon = true;
        else isTie = true;
      } else {
        continue; // no result
      }

      // Canonical order by key
      const aIsHome = homeLookup.key < awayLookup.key;
      const keyA = aIsHome ? homeLookup.key : awayLookup.key;
      const keyB = aIsHome ? awayLookup.key : homeLookup.key;
      const nameA = aIsHome ? homeLookup.name : awayLookup.name;
      const nameB = aIsHome ? awayLookup.name : homeLookup.name;
      const pairKey = `${keyA}__${keyB}`;

      if (!h2h.has(pairKey)) {
        h2h.set(pairKey, {
          nameA,
          nameB,
          winsA: 0,
          winsB: 0,
          ties: 0,
        });
      }
      const rec = h2h.get(pairKey)!;

      if (isTie) {
        rec.ties += 1;
      } else if (homeWon) {
        if (aIsHome) rec.winsA += 1;
        else rec.winsB += 1;
      } else if (awayWon) {
        if (aIsHome) rec.winsB += 1;
        else rec.winsA += 1;
      }
    }
  }

  return Array.from(h2h.entries())
    .map(([, r]) => ({
      ownerA: r.nameA,
      ownerB: r.nameB,
      winsA: r.winsA,
      winsB: r.winsB,
      ties: r.ties,
      totalGames: r.winsA + r.winsB + r.ties,
    }))
    .filter((r) => r.totalGames > 0)
    .sort((a, b) => b.totalGames - a.totalGames);
}

/** Championship list for display */
export function getChampionshipHistory() {
  const result: {
    sport: "football" | "baseball";
    year: number;
    champion: string;
    championOwner: string;
    runnerUp: string;
    runnerUpOwner: string;
  }[] = [];

  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      // Only completed seasons with a true champion
      const champ = season.teams.find((t) => t.final_standing === 1);
      if (!champ) continue;
      const runner = season.teams.find((t) => t.final_standing === 2);
      result.push({
        sport,
        year: season.year,
        champion: champ.team_name,
        championOwner: ownerDisplayName(champ),
        runnerUp: runner?.team_name || "—",
        runnerUpOwner: runner ? ownerDisplayName(runner) : "—",
      });
    }
  }

    // merge manual championships
  for (const m of getManualChampionships()) {
    result.push({
      sport: m.sport,
      year: m.year,
      champion: m.champion,
      championOwner: m.championOwner,
      runnerUp: m.runnerUp,
      runnerUpOwner: m.runnerUpOwner,
    });
  }

  return result.sort((a, b) => b.year - a.year || a.sport.localeCompare(b.sport));
}

/** Total archived seasons (FB + BB) for eligibility thresholds */
export function getTotalArchivedSeasonCount(): number {
  return getAvailableYears("football").length + getAvailableYears("baseball").length;
}

export function getMinSeasonsForAllTime(): number {
  const total = getTotalArchivedSeasonCount();
  return Math.max(1, Math.ceil(total * 0.55));
}

/** Reigning champion = winner of most recent COMPLETED season (final_standing === 1) */
export function getReigningChampion(sport: "football" | "baseball") {
  const years = getAvailableYears(sport); // newest first
  for (const year of years) {
    const season = getSeasonData(sport, year);
    if (!season) continue;
    const champ = season.teams.find((t) => t.final_standing === 1);
    if (!champ) continue; // season not finalized yet
    return {
      sport,
      year: season.year,
      teamName: champ.team_name,
      ownerName: ownerDisplayName(champ),
      wins: champ.wins,
      losses: champ.losses,
      ties: champ.ties ?? 0,
    };
  }
  return null;
}

/** All-time best / worst by win % with min seasons rule */
export function getAllTimeWinPctLeaders() {
  const minSeasons = getMinSeasonsForAllTime();
  const career = getCombinedOwnerCareerStats().filter((o) => o.seasons >= minSeasons);
  const withPct = career.map((o) => {
    const total = o.wins + o.losses + o.ties;
    const winPct = total > 0 ? o.wins / total : 0;
    return { ...o, winPct, totalGames: total };
  });
  const sortedDesc = [...withPct].sort((a, b) => b.winPct - a.winPct);
  const sortedAsc = [...withPct].sort((a, b) => a.winPct - b.winPct);
  return {
    minSeasons,
    best: sortedDesc[0] || null,
    worst: sortedAsc[0] || null,
  };
}

function recentFormScore(season: SeasonData, teamId: number, lastN = 4): number {
  const relevant = season.matchups.filter(
    (m) => m.home_team_id === teamId || m.away_team_id === teamId
  );
  // take last N with scores
  const played = relevant
    .filter((m) => m.home_score != null && m.away_score != null)
    .slice(-lastN);
  if (played.length === 0) return 0.5;
  let wins = 0;
  for (const m of played) {
    const isHome = m.home_team_id === teamId;
    const my = isHome ? m.home_score! : m.away_score!;
    const opp = isHome ? m.away_score! : m.home_score!;
    if (my > opp) wins += 1;
    else if (my === opp) wins += 0.5;
  }
  return wins / played.length;
}

function sosScore(season: SeasonData, teamId: number): number {
  // average opponent win % from season standings
  const teamMap = new Map(season.teams.map((t) => [t.team_id, t]));
  const opps: number[] = [];
  for (const m of season.matchups) {
    if (m.home_team_id === teamId && m.away_team_id != null) opps.push(m.away_team_id);
    if (m.away_team_id === teamId && m.home_team_id != null) opps.push(m.home_team_id);
  }
  if (opps.length === 0) return 0.5;
  let sum = 0;
  let n = 0;
  for (const id of opps) {
    const t = teamMap.get(id);
    if (!t) continue;
    const total = t.wins + t.losses + (t.ties ?? 0);
    if (total === 0) continue;
    sum += t.wins / total;
    n += 1;
  }
  return n > 0 ? sum / n : 0.5;
}

export type PowerRankEntry = {
  rank: number;
  teamId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  score: number;
  winPct: number;
  form: number;
  sos: number;
};

/** Balanced power rankings for one season */
export function getSeasonPowerRankings(
  sport: "football" | "baseball",
  year: number
): PowerRankEntry[] {
  const season = getSeasonData(sport, year);
  if (!season) return [];

  const raw = season.teams.map((t) => {
    const total = t.wins + t.losses + (t.ties ?? 0);
    const winPct = total > 0 ? t.wins / total : 0;
    const pf = t.points_for || 0;
    const form = recentFormScore(season, t.team_id);
    const sos = sosScore(season, t.team_id);
    return {
      teamId: t.team_id,
      teamName: t.team_name,
      ownerName: ownerDisplayName(t),
      wins: t.wins,
      losses: t.losses,
      ties: t.ties ?? 0,
      pointsFor: pf,
      winPct,
      form,
      sos,
    };
  });

  const maxPf = Math.max(...raw.map((r) => r.pointsFor), 1);

  const scored = raw.map((r) => {
    const pfNorm = r.pointsFor / maxPf;
    // 40% win% + 30% PF + 20% form + 10% SOS
    const score = r.winPct * 0.4 + pfNorm * 0.3 + r.form * 0.2 + r.sos * 0.1;
    return { ...r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((r, i) => ({ ...r, rank: i + 1 }));
}

/** All-time power ranking from career stats */
export function getAllTimePowerRankings(): (PowerRankEntry & {
  seasons: number;
  championships: number;
})[] {
  const minSeasons = getMinSeasonsForAllTime();
  const career = getCombinedOwnerCareerStats().filter((o) => o.seasons >= minSeasons);
  const maxPf = Math.max(...career.map((o) => o.pointsFor), 1);
  const maxTitles = Math.max(...career.map((o) => o.championships), 1);

  const scored = career.map((o) => {
    const total = o.wins + o.losses + o.ties;
    const winPct = total > 0 ? o.wins / total : 0;
    const pfNorm = o.pointsFor / maxPf;
    const titleNorm = o.championships / maxTitles;
    // career: 45% win% + 25% PF + 20% titles + 10% longevity (seasons)
    const longevity = Math.min(o.seasons / getTotalArchivedSeasonCount(), 1);
    const score =
      winPct * 0.45 + pfNorm * 0.25 + titleNorm * 0.2 + longevity * 0.1;
    return {
      rank: 0,
      teamId: 0,
      teamName: o.displayName,
      ownerName: o.displayName,
      wins: o.wins,
      losses: o.losses,
      ties: o.ties,
      pointsFor: o.pointsFor,
      score,
      winPct,
      form: 0,
      sos: 0,
      seasons: o.seasons,
      championships: o.championships,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((r, i) => ({ ...r, rank: i + 1 }));
}

export type H2HDetailed = HeadToHeadRecord & {
  footballWinsA: number;
  footballWinsB: number;
  footballTies: number;
  baseballWinsA: number;
  baseballWinsB: number;
  baseballTies: number;
};

/** H2H with FB/BB split */
export function getHeadToHeadRecordsDetailed(): H2HDetailed[] {
  const combined = getHeadToHeadRecords();
  const fb = getHeadToHeadRecords("football");
  const bb = getHeadToHeadRecords("baseball");

  const key = (a: string, b: string) => [a, b].sort().join("__");

  const fbMap = new Map<string, HeadToHeadRecord>();
  for (const r of fb) fbMap.set(key(r.ownerA, r.ownerB), r);
  const bbMap = new Map<string, HeadToHeadRecord>();
  for (const r of bb) bbMap.set(key(r.ownerA, r.ownerB), r);

  return combined.map((r) => {
    const k = key(r.ownerA, r.ownerB);
    const f = fbMap.get(k);
    const b = bbMap.get(k);

    // Align A/B orientation with combined record
    let footballWinsA = 0,
      footballWinsB = 0,
      footballTies = 0;
    if (f) {
      if (f.ownerA === r.ownerA) {
        footballWinsA = f.winsA;
        footballWinsB = f.winsB;
      } else {
        footballWinsA = f.winsB;
        footballWinsB = f.winsA;
      }
      footballTies = f.ties;
    }
    let baseballWinsA = 0,
      baseballWinsB = 0,
      baseballTies = 0;
    if (b) {
      if (b.ownerA === r.ownerA) {
        baseballWinsA = b.winsA;
        baseballWinsB = b.winsB;
      } else {
        baseballWinsA = b.winsB;
        baseballWinsB = b.winsA;
      }
      baseballTies = b.ties;
    }

    return {
      ...r,
      footballWinsA,
      footballWinsB,
      footballTies,
      baseballWinsA,
      baseballWinsB,
      baseballTies,
    };
  });
}

/* getRandomQuote replaced below */


/** Manual championships (e.g. 2022 BB before current league ID) */
export function getManualChampionships(): {
  sport: "football" | "baseball";
  year: number;
  champion: string;
  championOwner: string;
  runnerUp: string;
  runnerUpOwner: string;
  note?: string;
}[] {
  try {
    const filePath = path.join(process.cwd(), "content", "manual-championships.json");
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

/** Division winners per season (best win% in each division) */
export function getDivisionTitles(): {
  sport: "football" | "baseball";
  year: number;
  divisionName: string;
  teamName: string;
  ownerName: string;
}[] {
  const out: {
    sport: "football" | "baseball";
    year: number;
    divisionName: string;
    teamName: string;
    ownerName: string;
  }[] = [];
  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      // only completed seasons
      if (!season.teams.some((t) => t.final_standing === 1)) continue;
      const byDiv = new Map<string, typeof season.teams>();
      for (const t of season.teams) {
        const key = String(t.division_id ?? t.division_name ?? "league");
        if (!byDiv.has(key)) byDiv.set(key, []);
        byDiv.get(key)!.push(t);
      }
      // only count if 2+ divisions
      if (byDiv.size < 2) continue;
      for (const [, teams] of byDiv) {
        const sorted = [...teams].sort((a, b) => {
          const at = a.wins + a.losses + (a.ties || 0);
          const bt = b.wins + b.losses + (b.ties || 0);
          const ap = at > 0 ? a.wins / at : 0;
          const bp = bt > 0 ? b.wins / bt : 0;
          if (bp !== ap) return bp - ap;
          return (b.points_for || 0) - (a.points_for || 0);
        });
        const w = sorted[0];
        if (!w) continue;
        out.push({
          sport,
          year: season.year,
          divisionName: w.division_name || "Division",
          teamName: w.team_name,
          ownerName: ownerDisplayName(w),
        });
      }
    }
  }
  return out;
}

/** Per-owner trophy case: championships + division titles */
export function getOwnerTrophies(ownerDisplay: string) {
  const champs = getChampionshipHistory().filter(
    (c) => c.championOwner === ownerDisplay
  );
  const divs = getDivisionTitles().filter((d) => d.ownerName === ownerDisplay);
  return { championships: champs, divisions: divs };
}

/** Last place finishes */
export function getLastPlaceHistory(): {
  sport: "football" | "baseball";
  year: number;
  teamName: string;
  ownerName: string;
  pointsFor: number | null;
}[] {
  const out: {
    sport: "football" | "baseball";
    year: number;
    teamName: string;
    ownerName: string;
    pointsFor: number | null;
  }[] = [];
  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      const sorted = [...season.teams].sort((a, b) => {
        const ar = a.final_standing ?? a.standing ?? 99;
        const br = b.final_standing ?? b.standing ?? 99;
        if (ar !== br) return br - ar; // highest rank number = last
        // fallback worst win%
        const at = a.wins + a.losses + (a.ties || 0);
        const bt = b.wins + b.losses + (b.ties || 0);
        const ap = at > 0 ? a.wins / at : 0;
        const bp = bt > 0 ? b.wins / bt : 0;
        return ap - bp;
      });
      // prefer final_standing max
      const byFinal = [...season.teams].filter((t) => t.final_standing != null);
      let last;
      if (byFinal.length) {
        last = byFinal.sort((a, b) => (b.final_standing || 0) - (a.final_standing || 0))[0];
      } else {
        last = sorted[0];
      }
      if (!last) continue;
      // skip in-progress seasons where final_standing is 0 for everyone
      if (season.teams.every((t) => !t.final_standing || t.final_standing === 0)) {
        // use worst record instead for in-progress
        last = [...season.teams].sort((a, b) => {
          const at = a.wins + a.losses + (a.ties || 0);
          const bt = b.wins + b.losses + (b.ties || 0);
          const ap = at > 0 ? a.wins / at : 0;
          const bp = bt > 0 ? b.wins / bt : 0;
          if (ap !== bp) return ap - bp;
          return (a.points_for || 0) - (b.points_for || 0);
        })[0];
      }
      if (!last) continue;
      out.push({
        sport,
        year: season.year,
        teamName: last.team_name,
        ownerName: ownerDisplayName(last),
        pointsFor: last.points_for,
      });
    }
  }
  return out.sort((a, b) => b.year - a.year || a.sport.localeCompare(b.sport));
}

export type Superlatives = {
  mostTitles: { name: string; value: number } | null;
  highestWinPct: { name: string; value: number; seasons: number } | null;
  lowestWinPct: { name: string; value: number; seasons: number } | null;
  mostSeasons: { name: string; value: number } | null;
  pointsKing: { name: string; value: number } | null;
  leastPoints: { name: string; value: number } | null;
  bestSingleSeason: { name: string; sport: string; year: number; record: string; winPct: number } | null;
  worstSingleSeason: { name: string; sport: string; year: number; record: string; winPct: number } | null;
  mostLastPlaces: { name: string; value: number } | null;
};

export function getSuperlatives(): Superlatives {
  const minSeasons = getMinSeasonsForAllTime();
  const career = getCombinedOwnerCareerStats();
  const eligible = career.filter((o) => o.seasons >= minSeasons);

  const mostTitles = [...career].sort((a, b) => b.championships - a.championships)[0];
  const withPct = eligible.map((o) => {
    const t = o.wins + o.losses + o.ties;
    return { ...o, winPct: t > 0 ? o.wins / t : 0 };
  });
  const highestWinPct = [...withPct].sort((a, b) => b.winPct - a.winPct)[0];
  const lowestWinPct = [...withPct].sort((a, b) => a.winPct - b.winPct)[0];
  const mostSeasons = [...career].sort((a, b) => b.seasons - a.seasons)[0];
  const withPf = eligible.filter((o) => o.pointsFor > 0);
  const pointsKing = [...withPf].sort((a, b) => b.pointsFor - a.pointsFor)[0];
  const leastPoints = [...withPf].sort((a, b) => a.pointsFor - b.pointsFor)[0];

  // single season best/worst with min games
  type SS = { name: string; sport: string; year: number; record: string; winPct: number; games: number };
  const seasons: SS[] = [];
  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      for (const t of season.teams) {
        const games = t.wins + t.losses + (t.ties || 0);
        if (games < 8) continue; // min games gate
        const winPct = games > 0 ? t.wins / games : 0;
        seasons.push({
          name: ownerDisplayName(t),
          sport,
          year: season.year,
          record: `${t.wins}-${t.losses}${t.ties ? `-${t.ties}` : ""}`,
          winPct,
          games,
        });
      }
    }
  }
  const bestSingleSeason = [...seasons].sort((a, b) => b.winPct - a.winPct || b.games - a.games)[0] || null;
  const worstSingleSeason = [...seasons].sort((a, b) => a.winPct - b.winPct || b.games - a.games)[0] || null;

  const lastPlaces = getLastPlaceHistory();
  const lastCount = new Map<string, number>();
  for (const lp of lastPlaces) {
    // skip pure in-progress noise? keep all
    lastCount.set(lp.ownerName, (lastCount.get(lp.ownerName) || 0) + 1);
  }
  let mostLastPlaces: { name: string; value: number } | null = null;
  for (const [name, value] of lastCount) {
    if (!mostLastPlaces || value > mostLastPlaces.value) mostLastPlaces = { name, value };
  }

  return {
    mostTitles: mostTitles ? { name: mostTitles.displayName, value: mostTitles.championships } : null,
    highestWinPct: highestWinPct ? { name: highestWinPct.displayName, value: highestWinPct.winPct, seasons: highestWinPct.seasons } : null,
    lowestWinPct: lowestWinPct ? { name: lowestWinPct.displayName, value: lowestWinPct.winPct, seasons: lowestWinPct.seasons } : null,
    mostSeasons: mostSeasons ? { name: mostSeasons.displayName, value: mostSeasons.seasons } : null,
    pointsKing: pointsKing ? { name: pointsKing.displayName, value: pointsKing.pointsFor } : null,
    leastPoints: leastPoints ? { name: leastPoints.displayName, value: leastPoints.pointsFor } : null,
    bestSingleSeason,
    worstSingleSeason,
    mostLastPlaces,
  };
}


export function getLeagueConfig(): {
  draftDate: string;
  draftLabel: string;
  dues: { seasonLabel: string; amount: number; paid: string[] };
} {
  try {
    const fp = path.join(process.cwd(), "content", "league.json");
    const raw = JSON.parse(fs.readFileSync(fp, "utf-8"));
    const cal = currentDuesSeason();
    return {
      ...raw,
      dues: {
        ...raw.dues,
        seasonLabel: raw.dues?.seasonLabel || cal.seasonLabel,
      },
    };
  } catch {
    const cal = currentDuesSeason();
    return {
      draftDate: "2026-09-06T19:00:00-04:00",
      draftLabel: "Football Draft",
      dues: { seasonLabel: cal.seasonLabel, amount: 25, paid: ["Will Golder"] },
    };
  }
}

export function getNicknames(): Record<string, string> {
  try {
    const fp = path.join(process.cwd(), "content", "nicknames.json");
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return {};
  }
}

export function getBios(): Record<string, string> {
  try {
    const fp = path.join(process.cwd(), "content", "bios.json");
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return {};
  }
}

export type Quote = { text: string; by: string; image?: string; video?: string };

export function getAllQuotes(): Quote[] {
  try {
    const fp = path.join(process.cwd(), "content", "quotes.json");
    const raw = JSON.parse(fs.readFileSync(fp, "utf-8"));
    if (Array.isArray(raw) && raw.length && typeof raw[0] === "string") {
      return raw.map((t: string) => ({ text: t, by: "" }));
    }
    return raw as Quote[];
  } catch {
    return [{ text: "Football. Baseball. One League. One Retard to Rule them All.", by: "League" }];
  }
}

export function getRandomQuote(): Quote {
  const quotes = getAllQuotes();
  return quotes[Math.floor(Math.random() * quotes.length)] || { text: "Fantasy Balls forever.", by: "" };
}

export function getYearJoined(displayName: string): number | null {
  let first: number | null = null;
  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      for (const team of season.teams) {
        if (ownerDisplayName(team) === displayName) {
          if (first === null || season.year < first) first = season.year;
        }
      }
    }
  }
  return first;
}

/** Biggest rival = worst win% against, min 10 games */
export function getBiggestRival(displayName: string): {
  opponent: string;
  wins: number;
  losses: number;
  ties: number;
  games: number;
} | null {
  const h2h = getHeadToHeadRecordsDetailed();
  let worst: { opponent: string; wins: number; losses: number; ties: number; games: number; pct: number } | null = null;
  for (const r of h2h) {
    let myWins = 0, theirWins = 0, ties = 0, opp = "";
    if (r.ownerA === displayName) {
      myWins = r.winsA; theirWins = r.winsB; ties = r.ties; opp = r.ownerB;
    } else if (r.ownerB === displayName) {
      myWins = r.winsB; theirWins = r.winsA; ties = r.ties; opp = r.ownerA;
    } else continue;
    const games = myWins + theirWins + ties;
    if (games < 10) continue;
    const pct = games > 0 ? myWins / games : 0;
    if (!worst || pct < worst.pct) {
      worst = { opponent: opp, wins: myWins, losses: theirWins, ties, games, pct };
    }
  }
  if (!worst) return null;
  return { opponent: worst.opponent, wins: worst.wins, losses: worst.losses, ties: worst.ties, games: worst.games };
}

export function getRivalryTiles(minGames = 10) {
  const h2h = getHeadToHeadRecordsDetailed().filter((r) => r.totalGames >= minGames);
  const mostGames = [...h2h].sort((a, b) => b.totalGames - a.totalGames).slice(0, 6);
  const closest = [...h2h]
    .map((r) => {
      const gap = Math.abs(r.winsA - r.winsB) / Math.max(r.totalGames, 1);
      return { ...r, gap };
    })
    .sort((a, b) => a.gap - b.gap || b.totalGames - a.totalGames)
    .slice(0, 6);
  const mostGamesAll = [...h2h].sort((a, b) => b.totalGames - a.totalGames);
  const closestAll = [...h2h]
    .map((r) => {
      const gap = Math.abs(r.winsA - r.winsB) / Math.max(r.totalGames, 1);
      return { ...r, gap };
    })
    .sort((a, b) => a.gap - b.gap || b.totalGames - a.totalGames);
  const named = (r: (typeof h2h)[0]) => ({
    ...r,
    name: rivalryName(r.ownerA, r.ownerB),
  });
  return {
    mostGames: mostGames.map(named),
    closest: closest.map(named),
    mostGamesAll: mostGamesAll.map(named),
    closestAll: closestAll.map(named),
  };
}

export type TeamSeasonAdvanced = {
  teamId: number;
  teamName: string;
  ownerName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  ppg: number;
  papg: number;
  diff: number;
  bestWeek: number | null;
  worstWeek: number | null;
  avgMarginWin: number | null;
  avgMarginLoss: number | null;
  blowoutWins: number;
  badBeats: number;
  longestWinStreak: number;
  longestLossStreak: number;
  closeWins: number;
  closeLosses: number;
  firstHalfW: number;
  firstHalfL: number;
  secondHalfW: number;
  secondHalfL: number;
  sos: number;
  games: number;
};

function weeklyScoresForTeam(season: SeasonData, teamId: number): number[] {
  const scores: number[] = [];
  for (const m of season.matchups || []) {
    if (m.home_team_id === teamId && m.home_score != null) scores.push(Number(m.home_score));
    else if (m.away_team_id === teamId && m.away_score != null) scores.push(Number(m.away_score));
  }
  return scores;
}

function streakFromResults(results: ("W" | "L" | "T")[], kind: "W" | "L"): number {
  let best = 0;
  let cur = 0;
  for (const r of results) {
    if (r === kind) {
      cur += 1;
      best = Math.max(best, cur);
    } else cur = 0;
  }
  return best;
}

export function getTeamSeasonAdvanced(
  sport: "football" | "baseball",
  year: number
): TeamSeasonAdvanced[] {
  const season = getSeasonData(sport, year);
  if (!season) return [];

  const teamMap = new Map(season.teams.map((t) => [t.team_id, t]));
  const results: Record<number, ("W" | "L" | "T")[]> = {};
  const marginsWin: Record<number, number[]> = {};
  const marginsLoss: Record<number, number[]> = {};
  const closeW: Record<number, number> = {};
  const closeL: Record<number, number> = {};
  const blowW: Record<number, number> = {};
  const badBeat: Record<number, number> = {};
  const firstW: Record<number, number> = {};
  const firstL: Record<number, number> = {};
  const secondW: Record<number, number> = {};
  const secondL: Record<number, number> = {};

  for (const t of season.teams) {
    results[t.team_id] = [];
    marginsWin[t.team_id] = [];
    marginsLoss[t.team_id] = [];
    closeW[t.team_id] = 0;
    closeL[t.team_id] = 0;
    blowW[t.team_id] = 0;
    badBeat[t.team_id] = 0;
    firstW[t.team_id] = 0;
    firstL[t.team_id] = 0;
    secondW[t.team_id] = 0;
    secondL[t.team_id] = 0;
  }

  const periods = (season.matchups || [])
    .map((m) => m.matchup_period || 0)
    .filter(Boolean);
  const maxPeriod = periods.length ? Math.max(...periods) : 0;
  const half = maxPeriod / 2;

  for (const m of season.matchups || []) {
    const hs = m.home_score;
    const as_ = m.away_score;
    if (hs == null || as_ == null) continue;
    const hid = m.home_team_id;
    const aid = m.away_team_id;
    if (hid == null || aid == null) continue;
    const period = m.matchup_period || 0;
    const isFirst = period <= half;

    const apply = (id: number, my: number, opp: number) => {
      const margin = my - opp;
      if (margin > 0) {
        results[id]?.push("W");
        marginsWin[id]?.push(margin);
        if (margin <= 10) closeW[id] = (closeW[id] || 0) + 1;
        if (margin >= 30) blowW[id] = (blowW[id] || 0) + 1;
        if (isFirst) firstW[id] = (firstW[id] || 0) + 1;
        else secondW[id] = (secondW[id] || 0) + 1;
      } else if (margin < 0) {
        results[id]?.push("L");
        marginsLoss[id]?.push(Math.abs(margin));
        if (Math.abs(margin) <= 10) closeL[id] = (closeL[id] || 0) + 1;
        if (my >= (season.teams.reduce((s, t) => s + (t.points_for || 0), 0) / Math.max(season.teams.length, 1)) * 0.9 && margin < 0) {
          // rough bad beat: lost but scored a lot relative — skip complex
        }
        if (Math.abs(margin) <= 5 && my > opp * 0.95) badBeat[id] = (badBeat[id] || 0) + 1;
        if (isFirst) firstL[id] = (firstL[id] || 0) + 1;
        else secondL[id] = (secondL[id] || 0) + 1;
      } else {
        results[id]?.push("T");
      }
    };
    apply(hid, Number(hs), Number(as_));
    apply(aid, Number(as_), Number(hs));
  }

  // SOS from opponent win%
  const oppWinPctSum: Record<number, number> = {};
  const oppWinPctN: Record<number, number> = {};
  for (const m of season.matchups || []) {
    const hid = m.home_team_id;
    const aid = m.away_team_id;
    if (hid == null || aid == null) continue;
    const home = teamMap.get(hid);
    const away = teamMap.get(aid);
    if (!home || !away) continue;
    const hTot = home.wins + home.losses + (home.ties || 0);
    const aTot = away.wins + away.losses + (away.ties || 0);
    const hPct = hTot > 0 ? home.wins / hTot : 0.5;
    const aPct = aTot > 0 ? away.wins / aTot : 0.5;
    oppWinPctSum[hid] = (oppWinPctSum[hid] || 0) + aPct;
    oppWinPctN[hid] = (oppWinPctN[hid] || 0) + 1;
    oppWinPctSum[aid] = (oppWinPctSum[aid] || 0) + hPct;
    oppWinPctN[aid] = (oppWinPctN[aid] || 0) + 1;
  }

  return season.teams.map((t) => {
    const scores = weeklyScoresForTeam(season, t.team_id);
    const games = t.wins + t.losses + (t.ties || 0);
    const pf = t.points_for || 0;
    const pa = t.points_against || 0;
    const res = results[t.team_id] || [];
    const mw = marginsWin[t.team_id] || [];
    const ml = marginsLoss[t.team_id] || [];
    return {
      teamId: t.team_id,
      teamName: t.team_name,
      ownerName: ownerDisplayName(t),
      wins: t.wins,
      losses: t.losses,
      ties: t.ties || 0,
      pointsFor: pf,
      pointsAgainst: pa,
      ppg: games > 0 ? pf / games : scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      papg: games > 0 ? pa / games : 0,
      diff: pf - pa,
      bestWeek: scores.length ? Math.max(...scores) : null,
      worstWeek: scores.length ? Math.min(...scores) : null,
      avgMarginWin: mw.length ? mw.reduce((a, b) => a + b, 0) / mw.length : null,
      avgMarginLoss: ml.length ? ml.reduce((a, b) => a + b, 0) / ml.length : null,
      blowoutWins: blowW[t.team_id] || 0,
      badBeats: badBeat[t.team_id] || 0,
      longestWinStreak: streakFromResults(res, "W"),
      longestLossStreak: streakFromResults(res, "L"),
      closeWins: closeW[t.team_id] || 0,
      closeLosses: closeL[t.team_id] || 0,
      firstHalfW: firstW[t.team_id] || 0,
      firstHalfL: firstL[t.team_id] || 0,
      secondHalfW: secondW[t.team_id] || 0,
      secondHalfL: secondL[t.team_id] || 0,
      sos: oppWinPctN[t.team_id]
        ? oppWinPctSum[t.team_id] / oppWinPctN[t.team_id]
        : 0.5,
      games,
    };
  });
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getOwnerBySlug(slug: string) {
  const career = getCombinedOwnerCareerStats();
  return career.find((o) => slugifyName(o.displayName) === slug) || null;
}

export function getOwnerSeasonLog(displayName: string) {
  const log: {
    sport: "football" | "baseball";
    year: number;
    teamName: string;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number | null;
    finalStanding: number | null;
    divisionName: string | null;
  }[] = [];
  for (const sport of ["football", "baseball"] as const) {
    for (const season of getAllSeasons(sport)) {
      for (const t of season.teams) {
        if (ownerDisplayName(t) !== displayName) continue;
        log.push({
          sport,
          year: season.year,
          teamName: t.team_name,
          wins: t.wins,
          losses: t.losses,
          ties: t.ties || 0,
          pointsFor: t.points_for,
          finalStanding: t.final_standing,
          divisionName: t.division_name || null,
        });
      }
    }
  }
  return log.sort((a, b) => b.year - a.year || a.sport.localeCompare(b.sport));
}


export function lookupBio(displayName: string): string | undefined {
  const bios = getBios();
  if (bios[displayName]) return bios[displayName];
  const lower = displayName.toLowerCase();
  for (const [k, v] of Object.entries(bios)) {
    if (k.toLowerCase() === lower) return v;
    // first name match for short keys like Owen, Skyler
    if (lower.startsWith(k.toLowerCase() + " ") || k.toLowerCase().startsWith(lower.split(" ")[0])) {
      if (k.toLowerCase() === lower.split(" ")[0] || lower.split(" ")[0] === k.toLowerCase()) return v;
    }
  }
  // last-name match
  const last = lower.split(" ").slice(-1)[0];
  for (const [k, v] of Object.entries(bios)) {
    if (k.toLowerCase().endsWith(last) && last.length > 3) return v;
  }
  return undefined;
}

export function lookupNickname(displayName: string): string | undefined {
  const nicks = getNicknames();
  if (nicks[displayName]) return nicks[displayName];
  const lower = displayName.toLowerCase();
  for (const [k, v] of Object.entries(nicks)) {
    if (k.toLowerCase() === lower) return v;
    if (lower.startsWith(k.toLowerCase() + " ")) return v;
    if (k.toLowerCase().split(" ")[0] === lower.split(" ")[0] && k.split(" ").length === 1) return v;
  }
  return undefined;
}

export function ordinal(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (abs % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}


export function managerPhotoUrl(displayName: string): string | null {
  const slug = slugifyName(displayName);
  const pub = path.join(process.cwd(), "public", "managers");
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const fp = path.join(pub, `${slug}.${ext}`);
    if (fs.existsSync(fp)) return `/managers/${slug}.${ext}`;
  }
  return null;
}


export type TimelineEvent = { date: string; title: string; body: string };

export function getTimeline(): TimelineEvent[] {
  const fp = path.join(process.cwd(), "content", "timeline.json");
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as TimelineEvent[];
  } catch {
    return [];
  }
}

export function rivalryName(ownerA: string, ownerB: string): string | null {
  const fp = path.join(process.cwd(), "content", "rivalry-names.json");
  if (!fs.existsSync(fp)) return null;
  try {
    const map = JSON.parse(fs.readFileSync(fp, "utf-8")) as Record<string, string>;
    const k1 = `${ownerA}|${ownerB}`;
    const k2 = `${ownerB}|${ownerA}`;
    return map[k1] || map[k2] || null;
  } catch {
    return null;
  }
}

export function currentDuesSeason(now = new Date()): { seasonLabel: string; sport: "football" | "baseball"; year: number } {
  const y = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  // Aug 1 → Feb 28/29: football of the Aug year
  // Mar 1 → Jul 31: baseball of that year
  const afterAug1 = month > 8 || (month === 8 && day >= 1);
  const beforeMar1 = month < 3 || (month === 3 && day < 1);
  if (month >= 8) {
    return { seasonLabel: `${y} Football`, sport: "football", year: y };
  }
  if (month >= 3) {
    return { seasonLabel: `${y} Baseball`, sport: "baseball", year: y };
  }
  // Jan-Feb: football of previous year still "upcoming/current" until Mar 1
  return { seasonLabel: `${y - 1} Football`, sport: "football", year: y - 1 };
}
