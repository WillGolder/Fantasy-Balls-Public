import Link from "next/link";
import {
  getCombinedOwnerCareerStats,
  getHeadToHeadRecords,
  getChampionshipHistory,
  getAvailableYears,
} from "@/lib/data";
import { siteName } from "@/lib/owners";
import { OverallView } from "./OverallView";

export default function OverallHistoryPage() {
  const careerRaw = getCombinedOwnerCareerStats();
  const h2hRaw = getHeadToHeadRecords();
  const championships = getChampionshipHistory();
  const footballYears = getAvailableYears("football");
  const baseballYears = getAvailableYears("baseball");

  const career = careerRaw.map((o) => {
    const total = o.wins + o.losses + o.ties;
    const winPct = total > 0 ? (o.wins / total) * 100 : 0;
    return {
      key: o.key,
      displayName: siteName(o.displayName),
      seasons: o.seasons,
      wins: o.wins,
      losses: o.losses,
      winPct: `${winPct.toFixed(1)}%`,
      pf: o.pointsFor > 0 ? o.pointsFor.toFixed(0) : "—",
      pa: o.pointsAgainst > 0 ? o.pointsAgainst.toFixed(0) : "—",
      championships: o.championships,
      footballChampionships: o.footballChampionships,
      baseballChampionships: o.baseballChampionships,
      pointsFor: o.pointsFor,
    };
  });
  const byTitles = [...careerRaw]
    .filter((o) => o.championships > 0)
    .sort((a, b) => b.championships - a.championships)
    .map((o) => ({ displayName: siteName(o.displayName), championships: o.championships }));
  const byPoints = [...careerRaw]
    .sort((a, b) => b.pointsFor - a.pointsFor)
    .slice(0, 10)
    .map((o) => ({
      displayName: siteName(o.displayName),
      pf: o.pointsFor > 0 ? o.pointsFor.toFixed(0) : "—",
    }));
  const h2h = h2hRaw.slice(0, 60).map((r) => ({
    ownerA: siteName(r.ownerA),
    ownerB: siteName(r.ownerB),
    record: `${r.winsA}–${r.winsB}${r.ties > 0 ? `–${r.ties}` : ""}`,
    totalGames: r.totalGames,
  }));

  return (
    <div className="space-y-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          Combined
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">
          Overall History
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          All-time records across Football &amp; Baseball · FB:{" "}
          {footballYears.join(", ") || "—"} · BB:{" "}
          {baseballYears.join(", ") || "—"}
        </p>
      </div>
      <OverallView
        championships={championships}
        career={career}
        byTitles={byTitles}
        byPoints={byPoints}
        h2h={h2h}
      />
      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
