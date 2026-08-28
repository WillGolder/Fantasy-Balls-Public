import Link from "next/link";
import {
  getAvailableYears,
  getSeasonData,
  getOwnerCareerStats,
} from "@/lib/data";
import { SeasonStandings } from "@/components/SeasonStandings";
import { CareerRecordsTable } from "@/components/CareerRecordsTable";
import { siteName } from "@/lib/owners";

export default function BaseballPage() {
  const years = getAvailableYears("baseball");
  const career = getOwnerCareerStats("baseball");

  return (
    <div className="space-y-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          ⚾ Baseball
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">
          Baseball History
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          League ID 1126511192 · Fantasy Balls · {years.length} seasons archived
        </p>
      </div>

      <section className="space-y-8">
        <h2 className="section-title">
          Season <span>Standings</span>
        </h2>
        {years.map((year) => {
          const season = getSeasonData("baseball", year);
          if (!season) return null;
          return (
            <div key={year} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {year}
                <span className="text-sm font-normal text-[var(--muted)]">
                  · {season.teams.length} teams
                </span>
              </h3>
              <SeasonStandings season={season} />
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <h2 className="section-title">
          All-Time <span>Baseball Records</span>
        </h2>
                <CareerRecordsTable
          rows={career.map((owner) => {
            const total = owner.wins + owner.losses + owner.ties;
            return {
              key: owner.key,
              name: siteName(owner.displayName),
              seasons: owner.seasons,
              wins: owner.wins,
              losses: owner.losses,
              winPct: total > 0 ? (owner.wins / total) * 100 : 0,
              pointsFor: owner.pointsFor || 0,
              championships: owner.championships,
            };
          })}
        />
      </section>

      <p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
