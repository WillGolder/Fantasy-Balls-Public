import Link from "next/link";
import {
  getCombinedOwnerCareerStats,
  getHeadToHeadRecordsDetailed,
  getOwnerTrophies,
} from "@/lib/data";
import { siteName } from "@/lib/owners";
import { AllTimeClient } from "./AllTimeClient";

export default function AllTimePage() {
  const career = getCombinedOwnerCareerStats();
  const h2h = getHeadToHeadRecordsDetailed();

  const standings = career.map((o) => {
    const total = o.wins + o.losses + o.ties;
    const winPct = total > 0 ? o.wins / total : 0;
    return {
      key: o.key,
      name: siteName(o.displayName),
      seasons: o.seasons,
      wins: o.wins,
      losses: o.losses,
      ties: o.ties,
      winPct,
      pointsFor: o.pointsFor,
      pointsAgainst: o.pointsAgainst,
      diff: o.pointsFor - o.pointsAgainst,
      titles: o.championships,
      divisions: getOwnerTrophies(o.displayName).divisions.length,
    };
  });

  // Build matrix data for client
  const names = standings.map((s) => s.name);
  const recordMap: Record<string, { wa: number; wb: number; ties: number }> = {};
  for (const r of h2h) {
    recordMap[`${siteName(r.ownerA)}__${siteName(r.ownerB)}`] = {
      wa: r.winsA,
      wb: r.winsB,
      ties: r.ties,
    };
    recordMap[`${siteName(r.ownerB)}__${siteName(r.ownerA)}`] = {
      wa: r.winsB,
      wb: r.winsA,
      ties: r.ties,
    };
  }

  return (
    <div className="space-y-10">
      <div className="page-header-bar">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-bright)]">
          Combined History
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-1">All-Time</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Career standings across Football and Baseball, plus the full head-to-head
          matrix. Click any column header to sort.
        </p>
      </div>

      <AllTimeClient standings={standings} names={names} recordMap={recordMap} />

      <p>
        <Link href="/" className="text-[var(--accent-bright)] hover:underline text-sm">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
