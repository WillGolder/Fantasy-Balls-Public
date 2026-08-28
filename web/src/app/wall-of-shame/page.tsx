import Link from "next/link";
import {
  getLastPlaceHistory,
  getSuperlatives,
  getCombinedOwnerCareerStats,
  getMinSeasonsForAllTime,
} from "@/lib/data";
import { siteName } from "@/lib/owners";
import { SortableTable, Column } from "@/components/SortableTable";
import { WallOfShameTables } from "./WallOfShameTables";

export default function WallOfShamePage() {
  const lastPlaces = getLastPlaceHistory();
  const sup = getSuperlatives();
  const minSeasons = getMinSeasonsForAllTime();
  const career = getCombinedOwnerCareerStats().filter(
    (o) => o.pointsFor > 0 && o.seasons >= minSeasons
  );
  const leastPf = [...career]
    .sort((a, b) => a.pointsFor - b.pointsFor)
    .slice(0, 12)
    .map((o) => ({
      key: o.key,
      name: siteName(o.displayName),
      pointsFor: o.pointsFor,
      seasons: o.seasons,
    }));

  const counts = new Map<string, number>();
  for (const lp of lastPlaces) {
    counts.set(lp.ownerName, (counts.get(lp.ownerName) || 0) + 1);
  }
  const mostLast = [...counts.entries()]
    .map(([name, value]) => ({ name: siteName(name), value }))
    .sort((a, b) => b.value - a.value);

  const lastRows = lastPlaces.map((lp) => ({
    key: `${lp.sport}-${lp.year}`,
    year: lp.year,
    sport: lp.sport === "football" ? "Football" : "Baseball",
    teamName: lp.teamName,
    ownerName: siteName(lp.ownerName),
    pointsFor: lp.pointsFor,
  }));

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          Nobody Wants Their Name Here
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">Wall of Shame</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Last-place finishes and least career points (min {minSeasons} seasons).
        </p>
      </div>

      {sup.mostLastPlaces && (
        <div className="card p-5 border-[var(--gold-dim)]">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] font-bold">
            Career Last-Place Leader
          </p>
          <p className="text-2xl font-black mt-1">
            {sup.mostLastPlaces.name}{" "}
            <span className="text-[var(--muted)] text-lg font-semibold">
              · {sup.mostLastPlaces.value}× last
            </span>
          </p>
        </div>
      )}

      <WallOfShameTables
        lastRows={lastRows}
        mostLast={mostLast}
        leastPf={leastPf}
      />

      <p>
        <Link href="/" className="text-[var(--gold)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
