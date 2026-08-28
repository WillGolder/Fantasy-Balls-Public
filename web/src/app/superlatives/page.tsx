import Link from "next/link";
import { getSuperlatives, getMinSeasonsForAllTime, getAllSeasons, ownerDisplayName, ordinal } from "@/lib/data";
import { siteName } from "@/lib/owners";

export default function SuperlativesPage() {
  const s = getSuperlatives();
  const minSeasons = getMinSeasonsForAllTime();

  // Best scoring season per sport
  function bestScoringSeason(sport: "football" | "baseball") {
    let best: { name: string; year: number; pf: number } | null = null;
    for (const season of getAllSeasons(sport)) {
      for (const t of season.teams) {
        const pf = t.points_for || 0;
        if (!pf) continue;
        if (!best || pf > best.pf) {
          best = { name: siteName(ownerDisplayName(t)), year: season.year, pf };
        }
      }
    }
    return best;
  }
  const bestFb = bestScoringSeason("football");
  const bestBb = bestScoringSeason("baseball");

  // Biggest fall: largest drop in final_standing year over year same sport
  function biggestFall() {
    let fall: { name: string; from: number; to: number; sport: string; years: string } | null = null;
    for (const sport of ["football", "baseball"] as const) {
      const seasons = getAllSeasons(sport).sort((a, b) => a.year - b.year);
      const byOwner = new Map<string, { year: number; rank: number }[]>();
      for (const season of seasons) {
        for (const t of season.teams) {
          const rank = t.final_standing;
          if (!rank || rank === 0) continue;
          const name = siteName(ownerDisplayName(t));
          if (!byOwner.has(name)) byOwner.set(name, []);
          byOwner.get(name)!.push({ year: season.year, rank });
        }
      }
      for (const [name, rows] of byOwner) {
        for (let i = 1; i < rows.length; i++) {
          const drop = rows[i].rank - rows[i - 1].rank;
          if (drop <= 0) continue;
          if (!fall || drop > fall.to - fall.from) {
            fall = {
              name,
              from: rows[i - 1].rank,
              to: rows[i].rank,
              sport,
              years: `${rows[i - 1].year}→${rows[i].year}`,
            };
          }
        }
      }
    }
    return fall;
  }
  const fall = biggestFall();

  const cards = [
    {
      label: "Most Championships",
      value: s.mostTitles ? s.mostTitles.name : "—",
      sub: s.mostTitles ? `${s.mostTitles.value} titles` : "",
    },
    {
      label: "Highest Career Win %",
      value: s.highestWinPct ? s.highestWinPct.name : "—",
      sub: s.highestWinPct
        ? `${(s.highestWinPct.value * 100).toFixed(1)}% · ${s.highestWinPct.seasons} seasons`
        : `Min ${minSeasons} seasons`,
    },
    {
      label: "Lowest Career Win %",
      value: s.lowestWinPct ? s.lowestWinPct.name : "—",
      sub: s.lowestWinPct
        ? `${(s.lowestWinPct.value * 100).toFixed(1)}% · ${s.lowestWinPct.seasons} seasons`
        : `Min ${minSeasons} seasons`,
    },
    {
      label: "Points King",
      value: s.pointsKing ? s.pointsKing.name : "—",
      sub: s.pointsKing ? `${s.pointsKing.value.toFixed(0)} PF career` : "",
    },
    {
      label: "Least Points",
      value: s.leastPoints ? s.leastPoints.name : "—",
      sub: s.leastPoints ? `${s.leastPoints.value.toFixed(0)} PF career` : "",
    },
    {
      label: "Best Single Season",
      value: s.bestSingleSeason ? s.bestSingleSeason.name : "—",
      sub: s.bestSingleSeason
        ? `${s.bestSingleSeason.year} ${s.bestSingleSeason.sport === "football" ? "Football" : "Baseball"} · ${s.bestSingleSeason.record} (${(s.bestSingleSeason.winPct * 100).toFixed(1)}%)`
        : "Min 8 games",
    },
    {
      label: "Worst Single Season",
      value: s.worstSingleSeason ? s.worstSingleSeason.name : "—",
      sub: s.worstSingleSeason
        ? `${s.worstSingleSeason.year} ${s.worstSingleSeason.sport === "football" ? "Football" : "Baseball"} · ${s.worstSingleSeason.record} (${(s.worstSingleSeason.winPct * 100).toFixed(1)}%)`
        : "Min 8 games",
    },
    {
      label: "Best Scoring Season — Football",
      value: bestFb ? bestFb.name : "—",
      sub: bestFb ? `${bestFb.year} · ${bestFb.pf.toFixed(0)} PF` : "",
    },
    {
      label: "Best Scoring Season — Baseball",
      value: bestBb ? bestBb.name : "—",
      sub: bestBb ? `${bestBb.year} · ${bestBb.pf.toFixed(0)} PF` : "",
    },
    {
      label: "Biggest Fall",
      value: fall ? fall.name : "—",
      sub: fall
        ? `${fall.years} ${fall.sport === "football" ? "Football" : "Baseball"} · ${ordinal(fall.from)} → ${ordinal(fall.to)}`
        : "Largest year-over-year standing drop",
    },
    {
      label: "Most Last-Place Finishes",
      value: s.mostLastPlaces ? s.mostLastPlaces.name : "—",
      sub: s.mostLastPlaces ? `${s.mostLastPlaces.value}× last` : "",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          League Records
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Superlatives</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Career cards use a minimum seasons rule. Single-season records need at least 8 games.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
              {c.label}
            </p>
            <p className="text-xl font-black mt-2 leading-tight">{c.value}</p>
            {c.sub && <p className="text-sm text-[var(--muted)] mt-1">{c.sub}</p>}
          </div>
        ))}
      </div>

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
